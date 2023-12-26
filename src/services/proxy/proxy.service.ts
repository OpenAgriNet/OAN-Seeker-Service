import { Injectable } from '@nestjs/common';

@Injectable()
export class ProxyService {

    async bapCLientApi(data) {
        console.log("bapCLientApi api calling")
        const axios = require('axios');
        // let data = JSON.stringify({
        //     "context": {
        //         "domain": "onest:work-opportunities",
        //         "action": "search",
        //         "version": "1.1.0",
        //         "bap_id": "jobs-bap.tekdinext.com",
        //         "bap_uri": "https://jobs-bap.tekdinext.com/",
        //         "bpp_id": "wo-ps-bpp-network.onest.network",
        //         "bpp_uri": "https://wo-ps-bpp-network.onest.network/",
        //         "location": {
        //             "country": {
        //                 "name": "India",
        //                 "code": "IND"
        //             },
        //             "city": {
        //                 "name": "Bangalore",
        //                 "code": "std:080"
        //             }
        //         },
        //         "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60008",
        //         "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60009",
        //         "timestamp": "2023-02-06T09:55:41.161Z"
        //     },
        //     "message": {
        //         "intent": {
        //             "item": {
        //                 "descriptor": {
        //                     "name": ""
        //                 }
        //             }
        //         }
        //     }
        // });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://65.0.93.247:8001/search',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        try {
            return await axios.request(config)
        } catch (error) {
            console.log("error", error)
            return error
        }



    }

    async bapCLientApi2(endPoint, body) {
        console.log("bapCLientApi2 api calling", endPoint)
        const axios = require('axios');
        let data = JSON.stringify(body);

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `http://65.0.93.247:8001/${endPoint}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        try {
            let response =  await axios.request(config)
            
            if(response.data) {
                console.log(JSON.stringify(response.data));

                return response.data
            }
        } catch (error) {
            console.log("error", error)
            //return error
        }



    }

}
