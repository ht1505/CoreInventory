const Groq = require('groq-sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Gather exact aggregate inventory metrics
    const [
      totalProducts,
      categories,
      lowStockCountResult,
      outOfStockCount,
      sampleLowStock,
      sampleOutOfStock,
      recentReceipts,
      recentDeliveries,
      recentTransfers,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
      }),
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT p.id) 
        FROM products p 
        JOIN stocks s ON p.id = s."productId" 
        WHERE s.quantity <= p."reorderLevel" AND s.quantity > 0
      `,
      prisma.product.count({
        where: {
          OR: [
            { stocks: { none: {} } },
            { stocks: { every: { quantity: 0 } } },
          ],
        },
      }),
      // Sample low stock products for illustration
      prisma.product.findMany({
        where: {
          stocks: {
            some: {
              quantity: { gt: 0, lte: 15 },
            },
          },
        },
        select: { name: true, sku: true, reorderLevel: true },
        take: 8,
      }),
      // Sample out of stock products for illustration
      prisma.product.findMany({
        where: {
          stocks: {
            every: { quantity: 0 },
          },
        },
        select: { name: true, sku: true },
        take: 8,
      }),
      prisma.receipt.findMany({
        include: { supplier: true, location: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.delivery.findMany({
        include: { location: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.transfer.findMany({
        include: { fromLocation: true, toLocation: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const lowStockCount = Number(lowStockCountResult[0]?.count || 0);
    const inStockCount = totalProducts - (lowStockCount + outOfStockCount);

    // 2. Specific search in case user asked about a specific product/SKU/keyword
    const STOP_WORDS = new Set([
      'where', 'what', 'which', 'who', 'how', 'when', 'why', 'is', 'are', 'was', 'were',
      'kept', 'stored', 'located', 'this', 'that', 'these', 'those', 'item', 'items',
      'product', 'products', 'the', 'in', 'at', 'on', 'for', 'of', 'and', 'to', 'from',
      'can', 'you', 'tell', 'me', 'find', 'show', 'give', 'check', 'details', 'detail',
      'stock', 'stocks', 'quantity', 'inventory', 'warehouse', 'please', 'about'
    ]);

    const rawTokens = message.match(/[A-Za-z0-9#-]+/g) || [];
    const searchTerms = rawTokens
      .map(w => w.replace(/^#/, ''))
      .filter(w => w.length >= 2 && !STOP_WORDS.has(w.toLowerCase()));

    const skuTokens = rawTokens
      .filter(t => /^[A-Za-z]+-[0-9]+$/i.test(t) || /^#?[0-9]{3,}$/.test(t))
      .map(t => t.replace(/^#/, ''));

    let matchedProducts = [];

    // Query by SKU tokens or product name
    const queryConditions = [];
    if (skuTokens.length > 0) {
      queryConditions.push(...skuTokens.map(tok => ({ sku: { contains: tok, mode: 'insensitive' } })));
      queryConditions.push(...skuTokens.map(tok => ({ name: { contains: tok, mode: 'insensitive' } })));
    }
    if (searchTerms.length > 0) {
      queryConditions.push(...searchTerms.map(term => ({ name: { contains: term, mode: 'insensitive' } })));
      queryConditions.push(...searchTerms.map(term => ({ sku: { contains: term, mode: 'insensitive' } })));
    }

    if (queryConditions.length > 0) {
      const candidates = await prisma.product.findMany({
        where: { OR: queryConditions },
        include: {
          category: true,
          stocks: {
            include: {
              location: {
                include: {
                  warehouse: true,
                },
              },
            },
          },
        },
        take: 20,
      });

      // Relevance score: higher score for candidates that match more search terms and SKU tokens
      const scored = candidates.map(p => {
        const fullText = `${p.name} ${p.sku}`.toLowerCase();
        let score = 0;
        for (const tok of skuTokens) {
          if (p.sku.toLowerCase().includes(tok.toLowerCase())) score += 10;
          if (p.name.toLowerCase().includes(tok.toLowerCase())) score += 8;
        }
        for (const term of searchTerms) {
          if (fullText.includes(term.toLowerCase())) score += 2;
        }
        return { product: p, score };
      });

      scored.sort((a, b) => b.score - a.score);
      matchedProducts = scored.slice(0, 5).map(s => s.product);
    }

    const categorySummary = categories.map(c => `${c.name} (${c._count.products})`).join(', ');

    const systemPrompt = `You are the AI Inventory Assistant for CoreInventory Management System.
You have access to live warehouse database metrics and product storage locations. Answer questions accurately and concisely based on the following exact figures.

EXACT INVENTORY TOTALS:
- Total Products in Database: ${totalProducts} (exactly 5,000 items)
- Healthy Stock Items: ${inStockCount} items
- Low Stock Items (at or below reorder threshold): EXACTLY ${lowStockCount} items
- Out of Stock Items (0 quantity): EXACTLY ${outOfStockCount} items

CATEGORIES BREAKDOWN:
- ${categorySummary}

EXAMPLES OF LOW STOCK ITEMS (8 illustrative examples out of ${lowStockCount} total):
${sampleLowStock.map(p => `• ${p.name} (${p.sku})`).join('\n')}

EXAMPLES OF OUT OF STOCK ITEMS (8 illustrative examples out of ${outOfStockCount} total):
${sampleOutOfStock.map(p => `• ${p.name} (${p.sku})`).join('\n')}

RECENT OPERATIONS:
- Receipts: ${recentReceipts.map(r => `${r.reference} from ${r.supplier.name} [${r.status}]`).join(', ') || 'None'}
- Deliveries: ${recentDeliveries.map(d => `${d.reference} to ${d.customerName} [${d.status}]`).join(', ') || 'None'}
- Transfers: ${recentTransfers.map(t => `${t.reference} (${t.fromLocation.name} → ${t.toLocation.name}) [${t.status}]`).join(', ') || 'None'}

${matchedProducts.length > 0 ? `MATCHED RELEVANT PRODUCTS & STORAGE LOCATIONS:
${matchedProducts.map(p => {
  const totalQty = p.stocks.reduce((acc, s) => acc + s.quantity, 0);
  const locationDetails = p.stocks.length > 0
    ? p.stocks.map(s => `${s.quantity} ${p.unit} in "${s.location.name}" (${s.location.warehouse?.name || 'Warehouse'})`).join(', ')
    : 'No physical location assigned in database';
  return `• Product: ${p.name}
    - SKU: ${p.sku}
    - Category: ${p.category?.name || 'N/A'}
    - Total Stock: ${totalQty} ${p.unit} (Reorder level: ${p.reorderLevel})
    - Storage Location(s): ${locationDetails}`;
}).join('\n')}` : ''}

CRITICAL RULES FOR ACCURACY:
1. When asked where an item is kept, stored, or located, you MUST state the exact storage location(s) and warehouse name(s) listed under "Storage Location(s)" in the MATCHED RELEVANT PRODUCTS data above.
   Example: State clearly the location name (e.g., Central Aisle B, Dispatch Bay) and warehouse name (e.g., Main Distribution Hub).
   Do NOT say that database records do not specify a location when location information is present above.
2. When asked "how many items are low on stock" or "count of low stock items", state clearly that there are ${lowStockCount} items in total.
3. When asked "how many items are out of stock", state clearly that there are ${outOfStockCount} items in total.
4. When asked for total products, state ${totalProducts} items.
5. Keep responses direct, well-formatted, and concise.`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    let reply = '';
    try {
      const completion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 450,
        temperature: 0.3,
      });
      reply = completion.choices[0]?.message?.content || 'No response generated.';
    } catch (_err) {
      const fallbackCompletion = await groq.chat.completions.create({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 450,
        temperature: 0.3,
      });
      reply = fallbackCompletion.choices[0]?.message?.content || 'No response generated.';
    }

    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Failed to process chat query', detail: error.message });
  }
};

module.exports = { chat };