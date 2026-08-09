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
        <td style="padding: 4px 0; font-weight: bold; width: 55%;">${item.name} ${item.options?.size ? `(${item.options.size.toUpperCase()})` : ''}</td>
        <td style="text-align: center; width: 15%;">${item.quantity}</td>
        <td style="text-align: right; width: 30%;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
      ${item.options?.crust ? `<tr><td colspan="3" style="font-size: 10px; color: #555; padding-left: 8px;">+ Crust: ${item.options.crust.name}</td></tr>` : ''}
      ${item.options?.addons?.length ? `
        <tr>
          <td colspan="3" style="font-size: 10px; color: #555; padding-bottom: 4px; padding-left: 8px;">
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
              width: 270px !important;
              margin: 0 auto !important;
              padding: 4px !important;
              color: #000 !important;
              background: #fff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
            width: 270px;
            margin: 0 auto;
            padding: 6px;
            color: #000000;
            background: #ffffff;
            font-size: 12px;
            line-height: 1.3;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
          }
          .center { text-align: center; }
          .bold { font-weight: 700; }
          .divider { border-bottom: 1.5px solid #000000; margin: 6px 0; }
          .divider-dashed { border-bottom: 1px solid #000000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; margin: 4px 0; }
          td, th { padding: 3px 0; color: #000000; }
          .logo-img {
            width: 52px;
            height: 52px;
            object-fit: contain;
            border-radius: 50%;
            display: block;
            margin: 0 auto 4px auto;
            filter: contrast(180%) grayscale(100%);
          }
        </style>
      </head>
      <body>
        <img src="assets/logo.png" alt="Logo" class="logo-img" />
        <div class="center bold" style="font-size: 15px; letter-spacing: 0.5px;">HABIBI BITES</div>
        <div class="center" style="font-size: 10.5px; font-weight: 600;">Fast Food & Traditional Kitchen</div>
        <div class="center" style="font-size: 10.5px;">Qila Didar Singh, Gujranwala</div>
        <div class="center bold" style="font-size: 11px;">Ph: 0302-4411700</div>
        <div class="divider"></div>
        <div style="font-size: 11.5px;"><span class="bold">Order ID:</span> ${order.id}</div>
        <div style="font-size: 11.5px;"><span class="bold">Date:</span> ${dateFormatted}</div>
        <div style="font-size: 11.5px;"><span class="bold">Payment:</span> ${order.payment || "Cash on Delivery"}</div>
        <div class="divider"></div>
        <div style="font-size: 11.5px;"><span class="bold">Customer:</span> ${order.customer?.name || "Guest"}</div>
        <div style="font-size: 11.5px;"><span class="bold">Phone:</span> ${order.customer?.phone || "N/A"}</div>
        <div style="font-size: 11.5px;"><span class="bold">Address:</span> ${order.customer?.address || "Takeaway"}</div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr style="border-bottom: 1.5px solid #000000;">
              <th style="text-align: left; font-size: 11px;">ITEM</th>
              <th style="text-align: center; font-size: 11px; width: 15%;">QTY</th>
              <th style="text-align: right; font-size: 11px; width: 30%;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        <div class="divider"></div>
        <table style="font-size: 12px;">
          <tr><td>Subtotal:</td><td style="text-align: right; font-weight: 600;">Rs. ${((order.total || 0) - (order.deliveryFee || 0)).toLocaleString()}</td></tr>
          <tr><td>Delivery Fee:</td><td style="text-align: right; font-weight: 600;">${(order.deliveryFee || 0) > 0 ? `Rs. ${order.deliveryFee}` : 'FREE'}</td></tr>
          <tr style="font-weight: 800; font-size: 14px; border-top: 1.5px solid #000000;">
            <td style="padding-top: 4px;">NET TOTAL:</td>
            <td style="text-align: right; padding-top: 4px;">Rs. ${(order.total || 0).toLocaleString()}</td>
          </tr>
        </table>
        <div class="divider"></div>
        <div class="center bold" style="font-size: 11.5px;">Thank You For Choosing Habibi Bites!</div>
        <div class="center" style="font-size: 9.5px; margin-top: 2px;">Hot & Fresh Food Delivered</div>
      </body>
      </html>
    `;
  }
}
