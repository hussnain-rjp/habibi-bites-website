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
}
