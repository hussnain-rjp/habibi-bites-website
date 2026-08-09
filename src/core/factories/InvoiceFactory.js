/**
 * Factory Pattern: InvoiceFactory
 * Single Responsibility: Converts order domain models into thermal printable receipt documents with logo.
 */
export class InvoiceFactory {
  static createPrintableHTML(order) {
    const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const itemsHTML = (order.items || []).map(item => `
      <tr>
        <td style="padding: 3px 0; font-weight: bold; width: 48%; word-break: break-word;">${item.name} ${item.options?.size ? `(${item.options.size.toUpperCase()})` : ''}</td>
        <td style="text-align: center; width: 14%; vertical-align: top;">${item.quantity}</td>
        <td style="text-align: right; width: 38%; white-space: nowrap; vertical-align: top;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
      ${item.options?.crust ? `<tr><td colspan="3" style="font-size: 9px; color: #333; padding-left: 4px;">+ Crust: ${item.options.crust.name}</td></tr>` : ''}
      ${item.options?.addons?.length ? `
        <tr>
          <td colspan="3" style="font-size: 9px; color: #333; padding-bottom: 3px; padding-left: 4px;">
            + Addons: ${item.options.addons.map(a => a.name).join(", ")}
          </td>
        </tr>
      ` : ''}
    `).join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${order.id}</title>
        <style>
          @page { size: portrait; margin: 0; }
          @media print {
            html, body {
              width: 200px !important;
              max-width: 200px !important;
              margin: 0 auto !important;
              padding: 2px !important;
              color: #000 !important;
              background: #fff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
            width: 200px;
            max-width: 200px;
            margin: 0 auto;
            padding: 4px;
            color: #000000;
            background: #ffffff;
            font-size: 10.5px;
            line-height: 1.25;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
            overflow: hidden;
          }
          .center { text-align: center; }
          .bold { font-weight: 700; }
          .divider { border-bottom: 1.5px solid #000000; margin: 5px 0; }
          table { width: 100%; table-layout: fixed; border-collapse: collapse; margin: 3px 0; }
          td, th { padding: 2px 0; color: #000000; word-break: break-word; }
          .logo-img {
            width: 68px;
            height: 68px;
            object-fit: contain;
            display: block;
            margin: 0 auto 4px auto;
            filter: contrast(200%) grayscale(100%);
          }
        </style>
      </head>
      <body>
        <img src="assets/logo.png" alt="Logo" class="logo-img" />
        <div class="center bold" style="font-size: 13.5px; letter-spacing: 0.3px;">HABIBI BITES</div>
        <div class="center" style="font-size: 9.5px; font-weight: 600;">Fast Food & Traditional Kitchen</div>
        <div class="center" style="font-size: 9.5px;">Qila Didar Singh, Gujranwala</div>
        <div class="center bold" style="font-size: 10px;">Ph: 0302-4411700</div>
        <div class="divider"></div>
        <div style="font-size: 10.5px;"><span class="bold">Order ID:</span> ${order.id}</div>
        <div style="font-size: 10.5px;"><span class="bold">Date:</span> ${dateFormatted}</div>
        <div style="font-size: 10.5px;"><span class="bold">Payment:</span> ${order.payment || "Cash on Delivery"}</div>
        <div class="divider"></div>
        <div style="font-size: 10.5px;"><span class="bold">Customer:</span> ${order.customer?.name || "Guest"}</div>
        <div style="font-size: 10.5px;"><span class="bold">Phone:</span> ${order.customer?.phone || "N/A"}</div>
        <div style="font-size: 10.5px; word-break: break-word;"><span class="bold">Address:</span> ${order.customer?.address || "Takeaway"}</div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr style="border-bottom: 1.5px solid #000000;">
              <th style="text-align: left; font-size: 10px; width: 48%;">ITEM</th>
              <th style="text-align: center; font-size: 10px; width: 14%;">QTY</th>
              <th style="text-align: right; font-size: 10px; width: 38%;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        <div class="divider"></div>
        <table style="font-size: 10.5px; table-layout: fixed; width: 100%;">
          <tr><td style="width: 50%;">Subtotal:</td><td style="text-align: right; font-weight: 600; width: 50%; white-space: nowrap;">Rs. ${((order.total || 0) - (order.deliveryFee || 0)).toLocaleString()}</td></tr>
          <tr><td style="width: 50%;">Delivery Fee:</td><td style="text-align: right; font-weight: 600; width: 50%; white-space: nowrap;">${(order.deliveryFee || 0) > 0 ? `Rs. ${order.deliveryFee}` : 'FREE'}</td></tr>
          <tr style="font-weight: 800; font-size: 12px; border-top: 1.5px solid #000000;">
            <td style="padding-top: 3px; width: 45%;">NET TOTAL:</td>
            <td style="text-align: right; padding-top: 3px; width: 55%; white-space: nowrap;">Rs. ${(order.total || 0).toLocaleString()}</td>
          </tr>
        </table>
        <div class="divider"></div>
        <div class="center bold" style="font-size: 10.5px;">Thank You For Choosing Habibi Bites!</div>
        <div class="center" style="font-size: 9px; margin-top: 2px;">Hot & Fresh Food Delivered</div>
      </body>
      </html>
    `;
  }

  static createDailyReportHTML(reportDate, orders) {
    const selectedDateOrders = (orders || []).filter(o => {
      const dateStr = (o.createdAt || o.created_at || '').split('T')[0];
      return dateStr === reportDate;
    });

    const reportTotalSales = selectedDateOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const reportDeliveredSales = selectedDateOrders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const reportDeliveredCount = selectedDateOrders.filter(o => o.status === 'delivered').length;
    const reportCancelledCount = selectedDateOrders.filter(o => o.status === 'cancelled').length;
    const reportActiveCount = selectedDateOrders.filter(o => ['received', 'queue', 'cooking', 'packing', 'delivery'].includes(o.status)).length;

    const codTotal = selectedDateOrders
      .filter(o => o.status !== 'cancelled' && (!o.payment || o.payment.toLowerCase().includes('cash')))
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const onlineTotal = selectedDateOrders
      .filter(o => o.status !== 'cancelled' && (o.payment && !o.payment.toLowerCase().includes('cash')))
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const avgOrderVal = selectedDateOrders.length > 0 ? (reportTotalSales / selectedDateOrders.length).toFixed(0) : 0;

    const itemSalesMap = {};
    selectedDateOrders.forEach(o => {
      if (o.status === 'cancelled') return;
      (o.items || []).forEach(it => {
        const key = it.name || 'Custom Item';
        if (!itemSalesMap[key]) itemSalesMap[key] = { name: key, qty: 0, total: 0 };
        itemSalesMap[key].qty += (it.quantity || 1);
        itemSalesMap[key].total += (parseFloat(it.price || 0) * (it.quantity || 1));
      });
    });
    const topItemsList = Object.values(itemSalesMap).sort((a, b) => b.total - a.total);

    const topItemsHTML = topItemsList.map((item, idx) => `
      <tr>
        <td style="padding: 3px 0; font-weight: bold; width: 50%; word-break: break-word;">${idx + 1}. ${item.name}</td>
        <td style="text-align: center; width: 18%;">${item.qty} pcs</td>
        <td style="text-align: right; width: 32%; font-weight: bold;">Rs. ${item.total.toLocaleString()}</td>
      </tr>
    `).join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daily Sales Report ${reportDate}</title>
        <style>
          @page { size: portrait; margin: 0; }
          @media print {
            html, body { width: 230px !important; margin: 0 auto !important; padding: 4px !important; }
          }
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            width: 230px;
            margin: 0 auto;
            padding: 6px;
            color: #000;
            background: #fff;
            font-size: 10.5px;
            line-height: 1.3;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1.5px solid #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 3px 0; table-layout: fixed; }
          td, th { padding: 2px 0; word-break: break-word; }
          .logo-img { width: 48px; height: 48px; object-fit: contain; display: block; margin: 0 auto 3px auto; filter: contrast(200%) grayscale(100%); }
        </style>
      </head>
      <body>
        <img src="assets/logo.png" alt="Logo" class="logo-img" />
        <div class="center bold" style="font-size: 14px;">HABIBI BITES</div>
        <div class="center bold" style="font-size: 11px;">DAILY SALES REPORT</div>
        <div class="center" style="font-size: 10px;">Date: ${reportDate}</div>
        <div class="divider"></div>
        <table>
          <tr><td><strong>Total Sales:</strong></td><td style="text-align: right; font-weight: bold;">Rs. ${reportTotalSales.toLocaleString()}</td></tr>
          <tr><td>Delivered Revenue:</td><td style="text-align: right;">Rs. ${reportDeliveredSales.toLocaleString()}</td></tr>
          <tr><td>Total Orders:</td><td style="text-align: right;">${selectedDateOrders.length}</td></tr>
          <tr><td>Delivered Orders:</td><td style="text-align: right;">${reportDeliveredCount}</td></tr>
          <tr><td>Active Queue:</td><td style="text-align: right;">${reportActiveCount}</td></tr>
          <tr><td>Cancelled Orders:</td><td style="text-align: right;">${reportCancelledCount}</td></tr>
          <tr><td>COD Total:</td><td style="text-align: right;">Rs. ${codTotal.toLocaleString()}</td></tr>
          <tr><td>Online Transfer:</td><td style="text-align: right;">Rs. ${onlineTotal.toLocaleString()}</td></tr>
          <tr><td>Avg Order Value:</td><td style="text-align: right; font-weight: bold;">Rs. ${avgOrderVal}</td></tr>
        </table>
        <div class="divider"></div>
        <div class="bold" style="font-size: 10.5px; margin-bottom: 3px;">ITEM SALES BREAKDOWN</div>
        <table>
          <thead>
            <tr style="border-bottom: 1.5px solid #000;">
              <th style="text-align: left; width: 50%;">Item</th>
              <th style="text-align: center; width: 18%;">Qty</th>
              <th style="text-align: right; width: 32%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${topItemsHTML || '<tr><td colspan="3" style="text-align: center;">No items sold</td></tr>'}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="center bold" style="font-size: 9.5px;">End of Report — Habibi Bites POS</div>
      </body>
      </html>
    `;
  }
}

