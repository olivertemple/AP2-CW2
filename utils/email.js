async function sendMailOrderConfimation(email, user_name, order_number, description, earthquake_info, sample_description, price, total, order_date, image_url, template) {
    try{
        let res = await fetch("https://lmuoyu2qlf.execute-api.eu-central-1.amazonaws.com/default/ap2_cw2_emailsend", {
            method: "POST",
            body: JSON.stringify({
                email: email,
                subject: template == "confirmation" ? "Order Confirmation!" : "Order Collected!",
                user_name: user_name,
                order_number: order_number,
                description: description,
                sample_description: sample_description,
                price: price,
                total: total,
                order_date: order_date,
                image: image_url,
                earthquake_info: earthquake_info,
                template: template
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

exports.sendMailOrderConfimation = sendMailOrderConfimation;
