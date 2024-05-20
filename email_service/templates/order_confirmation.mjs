export default function order_confirmation(user_name, order_number, order_items, order_date) {
    let items = [];
    let total_price = 0;
    for (let index in order_items){
        let order_item = order_items[index];
        total_price = total_price + order_item.item_value;
        
        let sample_collection_date = order_item.collection_date.split("T")[0];
        
        items.push(`
                <tr style="border-collapse:collapse">
                <td style="Margin:0;padding-bottom:5px;padding-left:20px;padding-right:20px;padding-top:25px;background-color:#f8f8f8" bgcolor="#f8f8f8" align="left"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
                <table class="es-left" cellspacing="0" cellpadding="0" align="left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                    <tr style="border-collapse:collapse">
                    <td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:270px">
                    <table cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr style="border-collapse:collapse">
                        <td align="center" style="padding:0;Margin:0;font-size:0"><a target="_blank" href="https://viewstripo.email/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#3CA7F1;font-size:14px"><img class="adapt-img" src="${order_item.image}" alt width="103" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
                        </tr>
                    </table></td>
                    </tr>
                </table><!--[if mso]></td><tr style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->
                <table class="es-right" cellspacing="0" cellpadding="0" align="right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                    <tr style="border-collapse:collapse">
                        <td align="left" style="padding:0;Margin:0;width:270px">
                            <table cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                <tr style="border-collapse:collapse">
                                <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:24px;color:#333333;font-size:16px"><strong style="line-height:150%">${order_item.shop_description}</strong></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px">Scientific Observations: ${order_item.observations}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px">Sample Collection Date: ${sample_collection_date}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px">Location: ${order_item.sample_country} (${order_item.sample_longitude}, ${order_item.sample_latitude})</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px">${order_item.sample_type}</p></td>
                                </tr>
                                <tr style="border-collapse:collapse">
                                <td align="left" style="padding:0;Margin:0;padding-top:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:23px;color:#333333;font-size:14px"><span style="font-size:15px"><strong style="line-height:150%">Item Price:</strong> €${order_item.item_value}</span></p></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table><!--[if mso]></td></tr></table><![endif]--></tr>
                </tr>
                `)
    }


    let content = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="padding:0;Margin:0">
    <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title>New email template 2024-05-06</title><!--[if (mso 16)]>
        <style type="text/css">
        a {text-decoration: none;}
        </style>
        <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
    <xml>
        <o:OfficeDocumentSettings>
        <o:AllowPNG></o:AllowPNG>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <style type="text/css">
    #outlook a {
        padding:0;
    }
    .ExternalClass {
        width:100%;
    }
    .ExternalClass,
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td,
    .ExternalClass div {
        line-height:100%;
    }
    .es-button {
        mso-style-priority:100!important;
        text-decoration:none!important;
    }
    a[x-apple-data-detectors] {
        color:inherit!important;
        text-decoration:none!important;
        font-size:inherit!important;
        font-family:inherit!important;
        font-weight:inherit!important;
        line-height:inherit!important;
    }
    .es-desk-hidden {
        display:none;
        float:left;
        overflow:hidden;
        width:0;
        max-height:0;
        line-height:0;
        mso-hide:all;
    }
        
    div#top {
        display: flex !important;
        flex-direction: column !important;
    }
    
    @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:30px!important; text-align:center } h2 { font-size:26px!important; text-align:center } h3 { font-size:20px!important; text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button, button.es-button { font-size:20px!important; display:block!important; padding:10px 20px 10px 20px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important;} .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
    @media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
    </style>
    </head>
    <body data-new-gr-c-s-loaded="14.1110.0" style="font-family:Arial, sans-serif;width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
    <div id="top" dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#555555;display: flex;flex-direction: column !important;align-items: center !important;">
            <!--[if gte mso 9]>
                <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                    <v:fill type="tile" color="#555555"></v:fill>
                </v:background>
            <![endif]-->
    <table class="es-wrapper" align="center" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;height:100%;background-repeat:repeat;background-position:center top;background-color:#555555">
        <tr style="border-collapse:collapse">
        <td valign="top" style="padding:0;Margin:0">
        <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;">
            <tr style="border-collapse:collapse">
            <td align="center" style="padding:0;Margin:0">
            <table class="es-content-body" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#F8F8F8;width:600px">
                <tr style="border-collapse:collapse">
                <td style="Margin:0;padding-left:10px;padding-right:10px;padding-top:20px;padding-bottom:20px;background-color:#191919" bgcolor="#191919" align="left">
                <table cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tr style="border-collapse:collapse">
                    <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
                    <table cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr style="border-collapse:collapse">
                        <td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://viewstripo.email/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#3CA7F1;font-size:14px"><img class="adapt-img" src="https://fhomcbi.stripocdn.email/content/guids/bad1b888-ca9a-475f-8c5e-5b56618bf690/images/favicon.png" alt width="105" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;width:15%"></a></td>
                        </tr>
                    </table></td>
                    </tr>
                </table></td>
                </tr>
                <tr style="border-collapse:collapse">
                <td style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px;background-color:#ffcc99" bgcolor="#ffcc99" align="left">
                <table  cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tr style="border-collapse:collapse">
                    <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                    <table cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr style="border-collapse:collapse">
                        <td align="center" style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px">
                        <div>
                            <h2 style="Margin:0;line-height:36px;mso-line-height-rule:exactly;font-family:Arial, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#242424"><span style="font-size:30px"><strong>Your order is confirmed. </strong></span><br></h2>
                        </div></td>
                        </tr>
                        <tr style="border-collapse:collapse">
                        <td align="center" style="padding:0;Margin:0;padding-left:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#242424;font-size:14px">Hi ${user_name}, we've received order № ${order_number} and it is awaiting collection.</p></td>
                        </tr>
                    
                    </table></td>
                    </tr>
                </table></td>
                </tr>
                <tr style="border-collapse:collapse">
                <td style="Margin:0;padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:15px;background-color:#f8f8f8" bgcolor="#f8f8f8" align="left">
                <table cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tr style="border-collapse:collapse">
                    <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
                    <table cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr style="border-collapse:collapse">
                        <td align="center" style="padding:0;Margin:0"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:Arial, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#191919">Items ordered<br></h2></td>
                        </tr>
                    </table></td>
                    </tr>
                </table></td>
                </tr>
                ${items.join("")}

           
                <tr style="border-collapse:collapse">
                <td style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px;background-color:#f8f8f8" bgcolor="#f8f8f8" align="left">
                <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tr style="border-collapse:collapse">
                    <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
                    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr style="border-collapse:collapse">
                        <td bgcolor="#f8f8f8" align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-top:20px;padding-bottom:20px;font-size:0">
                        <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                            <tr style="border-collapse:collapse">
                            <td style="padding:0;Margin:0;border-bottom:1px solid #191919;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td>
                            </tr>
                        </table></td>
                        </tr>
                        <tr style="border-collapse:collapse">
                        <td align="center" style="padding:0;Margin:0;padding-bottom:15px">
                        <table class="cke_show_border" height="101" cellspacing="1" cellpadding="1" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:240px">
                            <tr style="border-collapse:collapse">
                            <td style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Subtotal:</strong></p></td>
                            <td style="padding:0;Margin:0;text-align:right"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px">€${total_price}</p></td>
                            </tr>
                            <tr style="border-collapse:collapse">
                            <td style="padding:0;Margin:0;font-size:18px;line-height:36px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Order Total:</strong></p></td>
                            <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:36px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>€${total_price}</strong></p></td>
                            </tr>
                        </table></td>
                        </tr>
                    </table></td>
                    </tr>
                </table></td>
                </tr>
                <tr style="border-collapse:collapse">
                <td style="Margin:0;padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:15px;background-color:#eeeeee" bgcolor="#eeeeee" align="left">
                <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tr style="border-collapse:collapse">
                    <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
                    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    </table></td>
                    </tr>
                </table></td>
                </tr>
                <tr style="border-collapse:collapse">
                <td style="Margin:0;padding-top:10px;padding-left:20px;padding-right:20px;padding-bottom:30px;background-color:#eeeeee" bgcolor="#eeeeee" align="left">
                <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tr style="border-collapse:collapse">
                    <td align="left" style="padding:0;Margin:0;width:560px">
                    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr style="border-collapse:collapse">
                        <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Arial, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#242424">Order details</h3></td>
                        </tr>
                        <tr style="border-collapse:collapse">
                        <td align="center" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Order №:</strong> ${order_number}</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Collection Status:</strong> Awaiting Collection</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#333333;font-size:14px"><strong>Order date:</strong> ${order_date}</p><br /><img src="https://www.barcode-generator.org/zint/api.php?bc_number=20&bc_data=${order_number}" /></td>
                        </tr>
                    </table></td>
                    </tr>
                </table></td>
                </tr>
                <tr style="border-collapse:collapse">
                <td style="Margin:0;padding-left:20px;padding-right:20px;padding-top:25px;padding-bottom:30px;background-color:#f8f8f8" bgcolor="#f8f8f8" align="left">
                <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                    <tr style="border-collapse:collapse">
                    <td align="left" style="padding:0;Margin:0;width:560px">
                    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr style="border-collapse:collapse">
                        <td align="center" style="padding:0;Margin:0;padding-bottom:10px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Arial, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#242424">We're here to help</h3></td>
                        </tr>
                        <tr style="border-collapse:collapse">
                        <td align="center" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#242424;font-size:14px">Email us at <a href='mailto:sieswatchearthquakes@gmail.com'>sieswatchearthquakes@gmail.com</a></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Arial, sans-serif;line-height:21px;color:#242424;font-size:14px">for expert assistance.</p></td>
                        </tr>
                    </table></td>
                    </tr>
                </table></td>
                </tr>
            </table></td>
            </tr>
        </table>
       
        </td>
        </tr>
    </table>
    </div>
    </body>
    </html>
        `
    return content;
}

