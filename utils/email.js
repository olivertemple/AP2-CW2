async function sendMailOrderConfirmation(email, user_name, order_number, order_items, template, order_date) {
    try{
        let res = await fetch("https://lmuoyu2qlf.execute-api.eu-central-1.amazonaws.com/default/ap2_cw2_emailsend", {
            method: "POST",
            body: JSON.stringify({
                email: email,
                subject: template == "confirmation" ? "Order Confirmation!" : "Order Collected!",
                user_name: user_name,
                order_number: order_number,
                order_items: order_items,
                template: template,
                order_date: order_date
            })
        });

        if (res){
            return true;
        }
        return false;
    }catch(err) {
        return false;
    }
}

exports.sendMailOrderConfirmation = sendMailOrderConfirmation;
