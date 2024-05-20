import NodeMailer from 'nodemailer';
import collection from "./templates/collection.mjs";
import order_confirmation from "./templates/order_confirmation.mjs";

export const handler = async (event) => {
    if (event.body !== null && event.body !== undefined) {
        let body = JSON.parse(event.body)
        
        let content;
        let order_date_split = body.order_date.split("T");
        let date_string = `${order_date_split[0]} ${order_date_split[1].split(".")[0]}`
        
        if (body.template == "confirmation"){
            content = order_confirmation(
                body.user_name,
                body.order_number,
                body.order_items,
                date_string
            )
        }else if (body.template == "collection"){
            content = collection(
                body.user_name,
                body.order_number,
                body.order_items,
                date_string
            )
        }

        const transporter = NodeMailer.createTransport({
            host: "smtp.gmail.com",
            service: "Gmail",
            port: 587,
            auth: {
                user: 'sieswatchearthquakes@gmail.com',
                pass: 'bnql oxrb nwpc wafu'
            }
        })

        let res = await transporter.sendMail({
            from: 'sieswatchearthquakes@gmail.com',
            to: body.email,
            subject: body.subject,
            html: content
        })

        const response = {
            statusCode: 200,
            body: JSON.stringify(res),
        };
        return response;
    } else {
        const response = {
            statusCode: 400,
            body: { message: "invalid request body" }
        }
        return response;
    }
};
