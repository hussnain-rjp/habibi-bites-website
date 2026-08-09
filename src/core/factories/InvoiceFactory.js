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
          body { font-family: monospace; width: 280px; margin: 0 auto; padding: 10px; color: #000; background: #fff; font-size: 12px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          .logo-img { width: 68px; height: 68px; object-fit: contain; border-radius: 50%; display: block; margin: 0 auto 6px auto; border: 2px solid #000; }
        </style>
      </head>
      <body>
        <img src="assets/logo.png" alt="Logo" class="logo-img" />
        <div class="center bold" style="font-size: 16px;">HABIBI BITES</div>
        <div class="center">Fast Food & Traditional Kitchen</div>
        <div class="center">Qila Didar Singh, Gujranwala</div>
        <div class="center">Ph: 0302-4411700</div>
        <div class="divider"></div>
        <div><span class="bold">Order ID:</span> ${order.id}</div>
        <div><span class="bold">Date:</span> ${dateFormatted}</div>
        <div><span class="bold">Payment:</span> ${order.payment || "Cash on Delivery"}</div>
        <div class="divider"></div>
        <div><span class="bold">Customer:</span> ${order.customer?.name || "Guest"}</div>
        <div><span class="bold">Phone:</span> ${order.customer?.phone || "N/A"}</div>
        <div><span class="bold">Address:</span> ${order.customer?.address || "Takeaway"}</div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th style="text-align: left;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        <div class="divider"></div>
        <table>
          <tr><td>Subtotal:</td><td style="text-align: right;">Rs. ${((order.total || 0) - (order.deliveryFee || 0)).toLocaleString()}</td></tr>
          <tr><td>Delivery Fee:</td><td style="text-align: right;">${(order.deliveryFee || 0) > 0 ? `Rs. ${order.deliveryFee}` : 'FREE'}</td></tr>
          <tr style="font-weight: bold; font-size: 14px;">
            <td>NET TOTAL:</td>
            <td style="text-align: right;">Rs. ${(order.total || 0).toLocaleString()}</td>
          </tr>
        </table>
        <div class="divider"></div>
        <div class="center bold">Thank You For Choosing Habibi Bites!</div>
        <div class="center" style="font-size: 10px;">Hot & Fresh Food Delivered</div>
      </body>
      </html>
    `;
  }
}
