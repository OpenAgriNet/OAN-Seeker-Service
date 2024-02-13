import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { ProxyService } from 'src/services/proxy/proxy.service';
import { v4 as uuidv4 } from 'uuid';
const crypto = require('crypto');


@Injectable()
export class JobsService {

    private domain = process.env.DOMAIN;
    private bap_id = process.env.BAP_ID;
    private bap_uri = process.env.BAP_URI;

    constructor(private readonly hasuraService: HasuraService, private readonly proxyService: ProxyService, private readonly logger: LoggerService) { }

    async getJobs(getContentdto) {
        return this.hasuraService.findJobsCache(getContentdto);
    }

    async jobsApiCall() {
        this.logger.log('create jobs api calling')
        let data = {
            "context": {
                "domain": this.domain,
                "action": "search",
                "version": "1.1.0",
                "bap_id": this.bap_id,
                "bap_uri": this.bap_uri,
                "transaction_id": uuidv4(),
                "message_id": uuidv4(),
                "timestamp": new Date().toISOString()
            },
            "message": {
                "intent": {
                    "item": {
                        "descriptor": {
                            "name": ""
                        }
                    }
                }
            }
        }

        try {

            let response = await this.proxyService.bapCLientApi2('search', data)
            console.log("res", JSON.stringify(response))
            if (response) {
                let arrayOfObjects = []
                for (const responses of response.responses) {
                    if (responses.context.bpp_id !== "beckn-sandbox-bpp.becknprotocol.io") {

                    if(responses.context.bpp_id !== "beckn-sandbox-bpp.becknprotocol.io") {
                        for (const providers of responses.message.catalog.providers) {

                            for (const [index, item] of providers.items.entries()) {
    
                                let obj = {
                                    unique_id: this.generateFixedId(item.id, item.descriptor.name, responses.context.bpp_id),
                                    item_id: item.id,
                                    title: item?.descriptor?.name ? item.descriptor.name : '',
                                    description: item?.descriptor?.long_desc ? item.descriptor.long_desc : '',
                                    location_id: item?.location_ids[0] ? item.location_ids[0] : '',
                                    //city: providers.locations.find(item => item.id === items.location_ids[0]) ? providers.locations.find(item => item.id === items.location_ids[0]).city.name : null,
                                    city: providers?.locations[index]?.city.name ? providers.locations[index].city.name : '',
                                    state: providers?.locations[index]?.state.name ? providers.locations[index].state.name : '',
                                    //country: providers.locations[index].country.name ? providers.locations[index].country.name: '',
                                    provider_id: providers.id,
                                    provider_name: providers.descriptor.name,
                                    bpp_id: responses.context.bpp_id,
                                    bpp_uri: responses.context.bpp_uri,
                                    company: item?.creator?.descriptor?.name ? item.creator.descriptor.name : ''
                                }
                                arrayOfObjects.push(obj)
                            }
                        }
                    }

                }
                console.log("arrayOfObjects", arrayOfObjects)
                //return arrayOfObjects
                return this.hasuraService.insertCacheData(arrayOfObjects)
            }
        }

        } catch (error) {
            console.log("error", error)
        }

    
}

    async searchResponse(body) {
        return this.hasuraService.searchResponse(body);
    }

    generateFixedId(...strings) {
        const combinedString = strings.join('-'); // Combine strings using a separator
        const hash = crypto.createHash('sha256').update(combinedString).digest('hex');
        return hash;
    }

    async testApiCall() {
        const data = {
            "context": {
                "ttl": "PT10M",
                "action": "search",
                "timestamp": "2023-12-22T05:59:35.256Z",
                "message_id": "3c6b273f-d1aa-43b4-9bb1-aa9b5f1d7443",
                "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60019",
                "domain": "onest:work-opportunities",
                "version": "1.1.0",
                "bap_id": "jobs-bap.tekdinext.com",
                "bap_uri": "https://jobs-bap.tekdinext.com/",
                "location": {
                    "country": {
                        "name": "India",
                        "code": "IND"
                    },
                    "city": {
                        "name": "Bangalore",
                        "code": "std:080"
                    }
                }
            },
            "responses": [
                {
                    "context": {
                        "domain": "onest:work-opportunities",
                        "action": "on_search",
                        "version": "1.1.0",
                        "bpp_id": "dash-beckn.tibilapps.com",
                        "bpp_uri": "https://dash-beckn.tibilapps.com/protocol-network",
                        "country": "IND",
                        "city": "std:080",
                        "location": {
                            "country": {
                                "name": "India",
                                "code": "IND"
                            },
                            "city": {
                                "name": "Bangalore",
                                "code": "std:080"
                            }
                        },
                        "bap_id": "jobs-bap.tekdinext.com",
                        "bap_uri": "https://jobs-bap.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60019",
                        "message_id": "3c6b273f-d1aa-43b4-9bb1-aa9b5f1d7443",
                        "ttl": "PT10M",
                        "timestamp": "2023-12-22T05:59:40.000Z"
                    },
                    "message": {
                        "catalog": {
                            "providers": [
                                {
                                    "id": "1",
                                    "descriptor": {
                                        "name": "PGI technologies"
                                    },
                                    "locations": [
                                        {
                                            "id": "1",
                                            "city": {
                                                "name": "Noida",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "2",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "3",
                                            "city": {
                                                "name": "Delhi",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "4",
                                            "city": {
                                                "name": " Mumbai",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "5",
                                            "city": {
                                                "name": " Lucknow",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "6",
                                            "city": {
                                                "name": " Chandigarh",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "7",
                                            "city": {
                                                "name": " Bangalore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "8",
                                            "city": {
                                                "name": " Hyderabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "9",
                                            "city": {
                                                "name": " Chennai",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "10",
                                            "city": {
                                                "name": "\nMadhya Pradesh ",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "11",
                                            "city": {
                                                "name": " Baroda",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "12",
                                            "city": {
                                                "name": " Ahmedabad.",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "13",
                                            "city": {
                                                "name": "Pan India",
                                                "code": "IND"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "14",
                                            "city": {
                                                "name": "Pan India",
                                                "code": "IND"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "15",
                                            "city": {
                                                "name": "Kolar",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "16",
                                            "city": {
                                                "name": "Karnataka",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "17",
                                            "city": {
                                                "name": "Bengaluru",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "18",
                                            "city": {
                                                "name": "Koramangala",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "19",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "20",
                                            "city": {
                                                "name": "Ludhiana",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Punjab",
                                                "code": "PB"
                                            }
                                        },
                                        {
                                            "id": "21",
                                            "city": {
                                                "name": "Gurugram",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "22",
                                            "city": {
                                                "name": "Neemrana",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Rajasthan",
                                                "code": "RJ"
                                            }
                                        },
                                        {
                                            "id": "23",
                                            "city": {
                                                "name": "Gurugram",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": " Manesar",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "25",
                                            "city": {
                                                "name": "Guwhati ",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Assam",
                                                "code": "AS"
                                            }
                                        },
                                        {
                                            "id": "26",
                                            "city": {
                                                "name": "Ranchi",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Jharkhand",
                                                "code": "JH"
                                            }
                                        },
                                        {
                                            "id": "27",
                                            "city": {
                                                "name": "Hazaribagh",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Jharkhand",
                                                "code": "JH"
                                            }
                                        },
                                        {
                                            "id": "28",
                                            "city": {
                                                "name": "Daltenganj",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Jharkhand",
                                                "code": "JH"
                                            }
                                        },
                                        {
                                            "id": "29",
                                            "city": {
                                                "name": "Deogarh/Pakur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Jharkhand",
                                                "code": "JH"
                                            }
                                        },
                                        {
                                            "id": "30",
                                            "city": {
                                                "name": "Patna ",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Bihar",
                                                "code": "BR"
                                            }
                                        },
                                        {
                                            "id": "31",
                                            "city": {
                                                "name": "Midnipur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "West Bengal",
                                                "code": "WB"
                                            }
                                        },
                                        {
                                            "id": "32",
                                            "city": {
                                                "name": "Behrampore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "West Bengal",
                                                "code": "WB"
                                            }
                                        },
                                        {
                                            "id": "33",
                                            "city": {
                                                "name": "Burdwan",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "West Bengal",
                                                "code": "WB"
                                            }
                                        },
                                        {
                                            "id": "34",
                                            "city": {
                                                "name": "Howrah",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "West Bengal",
                                                "code": "WB"
                                            }
                                        },
                                        {
                                            "id": "35",
                                            "city": {
                                                "name": "Dimapur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Nagaland",
                                                "code": "NL"
                                            }
                                        },
                                        {
                                            "id": "36",
                                            "city": {
                                                "name": "Shillong",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Meghalaya",
                                                "code": "ML"
                                            }
                                        },
                                        {
                                            "id": "37",
                                            "city": {
                                                "name": "Agartala",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tripura",
                                                "code": "TR"
                                            }
                                        },
                                        {
                                            "id": "38",
                                            "city": {
                                                "name": "Balasore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Odisha",
                                                "code": "OD"
                                            }
                                        },
                                        {
                                            "id": "39",
                                            "city": {
                                                "name": "Jaypore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Odisha",
                                                "code": "OD"
                                            }
                                        },
                                        {
                                            "id": "40",
                                            "city": {
                                                "name": "Bolangir",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Odisha",
                                                "code": "OD"
                                            }
                                        },
                                        {
                                            "id": "41",
                                            "city": {
                                                "name": "Bhubneshwar",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Odisha",
                                                "code": "OD"
                                            }
                                        },
                                        {
                                            "id": "42",
                                            "city": {
                                                "name": "Moradabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "43",
                                            "city": {
                                                "name": "Rudrapur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttarakhand",
                                                "code": "UK"
                                            }
                                        },
                                        {
                                            "id": "44",
                                            "city": {
                                                "name": "Bareilly",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "45",
                                            "city": {
                                                "name": "Haridwar",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttarakhand",
                                                "code": "UK"
                                            }
                                        },
                                        {
                                            "id": "46",
                                            "city": {
                                                "name": "Dehradoon",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttarakhand",
                                                "code": "UK"
                                            }
                                        },
                                        {
                                            "id": "47",
                                            "city": {
                                                "name": "Meerut",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "48",
                                            "city": {
                                                "name": "ALWAR",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Rajasthan",
                                                "code": "RJ"
                                            }
                                        },
                                        {
                                            "id": "49",
                                            "city": {
                                                "name": "Gurgaon",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "50",
                                            "city": {
                                                "name": "Faridabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "51",
                                            "city": {
                                                "name": "LUDHIANA",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Punjab",
                                                "code": "PB"
                                            }
                                        },
                                        {
                                            "id": "52",
                                            "city": {
                                                "name": "Jalandhar",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Punjab",
                                                "code": "PB"
                                            }
                                        },
                                        {
                                            "id": "53",
                                            "city": {
                                                "name": "Ambala",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "54",
                                            "city": {
                                                "name": "Sonipat",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "55",
                                            "city": {
                                                "name": "Yamunanagar",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "56",
                                            "city": {
                                                "name": "Rohtak",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "57",
                                            "city": {
                                                "name": "Bahadurgarh",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "58",
                                            "city": {
                                                "name": "Mahendergarh",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "59",
                                            "city": {
                                                "name": "Karnal",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "60",
                                            "city": {
                                                "name": "Hisar",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "61",
                                            "city": {
                                                "name": "Lucknow",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "62",
                                            "city": {
                                                "name": "GORAKHPUR DEORIA",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "63",
                                            "city": {
                                                "name": "BALIA AZAMGARH",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "64",
                                            "city": {
                                                "name": "KANPUR",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "65",
                                            "city": {
                                                "name": "CHITRAKOOT",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "66",
                                            "city": {
                                                "name": "Allahabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "67",
                                            "city": {
                                                "name": "Jhansi",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "68",
                                            "city": {
                                                "name": "Kannauj",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "69",
                                            "city": {
                                                "name": "Lalitpur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "70",
                                            "city": {
                                                "name": "Etawah",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "71",
                                            "city": {
                                                "name": "Kota",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Rajasthan",
                                                "code": "RJ"
                                            }
                                        },
                                        {
                                            "id": "72",
                                            "city": {
                                                "name": "Bhilwara",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Rajasthan",
                                                "code": "RJ"
                                            }
                                        },
                                        {
                                            "id": "73",
                                            "city": {
                                                "name": "Udaipur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Rajasthan",
                                                "code": "RJ"
                                            }
                                        },
                                        {
                                            "id": "74",
                                            "city": {
                                                "name": "Barmer",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Rajasthan",
                                                "code": "RJ"
                                            }
                                        },
                                        {
                                            "id": "75",
                                            "city": {
                                                "name": "Pali",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Rajasthan",
                                                "code": "RJ"
                                            }
                                        },
                                        {
                                            "id": "76",
                                            "city": {
                                                "name": "Jodhpur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Rajasthan",
                                                "code": "RJ"
                                            }
                                        },
                                        {
                                            "id": "77",
                                            "city": {
                                                "name": "Tonk",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Rajasthan",
                                                "code": "RJ"
                                            }
                                        },
                                        {
                                            "id": "78",
                                            "city": {
                                                "name": "Derhionson",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Uttar Pradesh",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "79",
                                            "city": {
                                                "name": "Faridabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "80",
                                            "city": {
                                                "name": "Faridabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "81",
                                            "city": {
                                                "name": "Gurgaon",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "82",
                                            "city": {
                                                "name": "Gurgaon",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "83",
                                            "city": {
                                                "name": "Lucknow",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "UP",
                                                "code": "UP"
                                            }
                                        },
                                        {
                                            "id": "84",
                                            "city": {
                                                "name": "Dharuhera",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "85",
                                            "city": {
                                                "name": " Gurugram",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "86",
                                            "city": {
                                                "name": "Rewari",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Haryana",
                                                "code": "HR"
                                            }
                                        },
                                        {
                                            "id": "87",
                                            "city": {
                                                "name": "Surat/ Vadodara",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Gujarat",
                                                "code": "GJ"
                                            }
                                        },
                                        {
                                            "id": "88",
                                            "city": {
                                                "name": "Surat/ Vadodara",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Gujarat",
                                                "code": "GJ"
                                            }
                                        },
                                        {
                                            "id": "89",
                                            "city": {
                                                "name": "Surat/ Vadodara",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Gujarat",
                                                "code": "GJ"
                                            }
                                        },
                                        {
                                            "id": "90",
                                            "city": {
                                                "name": "Surat/ Vadodara",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Gujarat",
                                                "code": "GJ"
                                            }
                                        },
                                        {
                                            "id": "91",
                                            "city": {
                                                "name": "Mumbai/ Ahmedabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Maharashtra /Gujarat",
                                                "code": "Maharashtra /Gujarat"
                                            }
                                        },
                                        {
                                            "id": "92",
                                            "city": {
                                                "name": "Mumbai",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Maharashtra",
                                                "code": "MH"
                                            }
                                        },
                                        {
                                            "id": "93",
                                            "city": {
                                                "name": "Mumbai - Pune",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Maharashtra",
                                                "code": "MH"
                                            }
                                        },
                                        {
                                            "id": "94",
                                            "city": {
                                                "name": "Mumbai/ Pune/Ahmedabad/Bhopal",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Maharashtra/ MP/ Gujarat",
                                                "code": "Maharashtra/ MP/ Gujarat"
                                            }
                                        },
                                        {
                                            "id": "95",
                                            "city": {
                                                "name": "Mumbai",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Maharashtra",
                                                "code": "MH"
                                            }
                                        },
                                        {
                                            "id": "96",
                                            "city": {
                                                "name": "Pune",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Maharashtra",
                                                "code": "MH"
                                            }
                                        },
                                        {
                                            "id": "97",
                                            "city": {
                                                "name": "Mumbai",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Maharashtra",
                                                "code": "MH"
                                            }
                                        },
                                        {
                                            "id": "98",
                                            "city": {
                                                "name": "Hyderabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Telangana",
                                                "code": "TG"
                                            }
                                        },
                                        {
                                            "id": "99",
                                            "city": {
                                                "name": "Hyderabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Telangana",
                                                "code": "TG"
                                            }
                                        },
                                        {
                                            "id": "100",
                                            "city": {
                                                "name": "Hyderabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Telangana",
                                                "code": "TG"
                                            }
                                        },
                                        {
                                            "id": "101",
                                            "city": {
                                                "name": "Chennai",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tamil Nadu",
                                                "code": "TN"
                                            }
                                        },
                                        {
                                            "id": "102",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "103",
                                            "city": {
                                                "name": "Gulbarga",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "104",
                                            "city": {
                                                "name": "Madurai",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tamil Nadu",
                                                "code": "TN"
                                            }
                                        },
                                        {
                                            "id": "105",
                                            "city": {
                                                "name": "Karnool",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhra Pradesh",
                                                "code": "AP"
                                            }
                                        },
                                        {
                                            "id": "106",
                                            "city": {
                                                "name": "Cumbum",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tamil Nadu",
                                                "code": "TN"
                                            }
                                        },
                                        {
                                            "id": "107",
                                            "city": {
                                                "name": "Piduguralla",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhra Pradesh",
                                                "code": "AP"
                                            }
                                        },
                                        {
                                            "id": "108",
                                            "city": {
                                                "name": "Piduguralla",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhra Pradesh",
                                                "code": "AP"
                                            }
                                        },
                                        {
                                            "id": "109",
                                            "city": {
                                                "name": "Hyderabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Telangana",
                                                "code": "TG"
                                            }
                                        },
                                        {
                                            "id": "110",
                                            "city": {
                                                "name": "Andhra Pradesh",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhra Pradesh",
                                                "code": "AP"
                                            }
                                        },
                                        {
                                            "id": "111",
                                            "city": {
                                                "name": "Telangana",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Telangana",
                                                "code": "TG"
                                            }
                                        },
                                        {
                                            "id": "112",
                                            "city": {
                                                "name": "Cochin",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Kerala",
                                                "code": "KL"
                                            }
                                        },
                                        {
                                            "id": "113",
                                            "city": {
                                                "name": "Trichur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Kerala",
                                                "code": "KL"
                                            }
                                        },
                                        {
                                            "id": "114",
                                            "city": {
                                                "name": "Peenya",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "115",
                                            "city": {
                                                "name": "Hosur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tamil Nadu",
                                                "code": "TN"
                                            }
                                        },
                                        {
                                            "id": "116",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "117",
                                            "city": {
                                                "name": "Pan India",
                                                "code": "IND"
                                            },
                                            "state": {
                                                "name": "Pan India",
                                                "code": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "118",
                                            "city": {
                                                "name": "Noida/ Bangalore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "UP / Karnataka",
                                                "code": "UP / Karnataka"
                                            }
                                        },
                                        {
                                            "id": "119",
                                            "city": {
                                                "name": "Hyderabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Telangana",
                                                "code": "TG"
                                            }
                                        },
                                        {
                                            "id": "120",
                                            "city": {
                                                "name": "Secunderabad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Telangana",
                                                "code": "TG"
                                            }
                                        },
                                        {
                                            "id": "121",
                                            "city": {
                                                "name": "Vijaywada",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhra Pradesh",
                                                "code": "AP"
                                            }
                                        },
                                        {
                                            "id": "122",
                                            "city": {
                                                "name": "Vizag",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhra Pradesh",
                                                "code": "AP"
                                            }
                                        },
                                        {
                                            "id": "123",
                                            "city": {
                                                "name": "Ananthpur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhra Pradesh",
                                                "code": "AP"
                                            }
                                        },
                                        {
                                            "id": "124",
                                            "city": {
                                                "name": "Nellore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhra Pradesh",
                                                "code": "AP"
                                            }
                                        },
                                        {
                                            "id": "125",
                                            "city": {
                                                "name": "Warangal",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Telangana",
                                                "code": "TG"
                                            }
                                        },
                                        {
                                            "id": "126",
                                            "city": {
                                                "name": "Guntur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhra Pradesh",
                                                "code": "AP"
                                            }
                                        },
                                        {
                                            "id": "127",
                                            "city": {
                                                "name": "Karimnagar",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Telangana",
                                                "code": "TG"
                                            }
                                        },
                                        {
                                            "id": "128",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "129",
                                            "city": {
                                                "name": "Bijapur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "130",
                                            "city": {
                                                "name": "Shimogga",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "131",
                                            "city": {
                                                "name": "Chitradurga",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "132",
                                            "city": {
                                                "name": "Tumkur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "133",
                                            "city": {
                                                "name": "Davengere",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "134",
                                            "city": {
                                                "name": "Kottyam",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Kerala",
                                                "code": "KL"
                                            }
                                        },
                                        {
                                            "id": "135",
                                            "city": {
                                                "name": "Palakkad",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Kerala",
                                                "code": "KL"
                                            }
                                        },
                                        {
                                            "id": "136",
                                            "city": {
                                                "name": "Kesaragod",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Kerala",
                                                "code": "KL"
                                            }
                                        },
                                        {
                                            "id": "137",
                                            "city": {
                                                "name": "Erode",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tamil Nadu",
                                                "code": "TN"
                                            }
                                        },
                                        {
                                            "id": "138",
                                            "city": {
                                                "name": "Chennai",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tamil Nadu",
                                                "code": "TN"
                                            }
                                        },
                                        {
                                            "id": "139",
                                            "city": {
                                                "name": "Krishnagiri",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tamil Nadu",
                                                "code": "TN"
                                            }
                                        },
                                        {
                                            "id": "140",
                                            "city": {
                                                "name": "Namakkal",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tamil Nadu",
                                                "code": "TN"
                                            }
                                        },
                                        {
                                            "id": "141",
                                            "city": {
                                                "name": "Salem",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tamil Nadu",
                                                "code": "TN"
                                            }
                                        },
                                        {
                                            "id": "142",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "143",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka",
                                                "code": "KA"
                                            }
                                        },
                                        {
                                            "id": "144",
                                            "city": {
                                                "name": "Chowdavaram",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhrapradesh",
                                                "code": "Andhrapradesh"
                                            }
                                        },
                                        {
                                            "id": "145",
                                            "city": {
                                                "name": "Vankayalapadu",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Andhrapradesh",
                                                "code": "Andhrapradesh"
                                            }
                                        },
                                        {
                                            "id": "146",
                                            "city": {
                                                "name": "Bangalore and chennai",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Karnataka and tamilnadu",
                                                "code": "Karnataka and tamilnadu"
                                            }
                                        },
                                        {
                                            "id": "147",
                                            "city": {
                                                "name": "Hosur",
                                                "code": "std: 000"
                                            },
                                            "state": {
                                                "name": "Tamil Nadu",
                                                "code": "TN"
                                            }
                                        }
                                    ],
                                    "fulfillments": [
                                        {
                                            "id": "1",
                                            "type": "remote",
                                            "tracking": false
                                        },
                                        {
                                            "id": "2",
                                            "type": "hybrid",
                                            "tracking": false
                                        },
                                        {
                                            "id": "3",
                                            "type": "Onsite",
                                            "tracking": false
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "1",
                                            "descriptor": {
                                                "name": "BDE/CIC - Just Dial"
                                            },
                                            "location_ids": [
                                                "1"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "2",
                                            "descriptor": {
                                                "name": "Customer Support/Credit Card Sales/BPO - Vindhya E-Infomedia Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "3",
                                            "descriptor": {
                                                "name": "Associate / Sr. Associate - JM Financials"
                                            },
                                            "location_ids": [
                                                "3",
                                                "4",
                                                "5",
                                                "6",
                                                "7",
                                                "8",
                                                "9",
                                                "10",
                                                "11",
                                                "12"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "4",
                                            "descriptor": {
                                                "name": "Sahayak's - Jeevitam Sahayaks"
                                            },
                                            "location_ids": [
                                                "13"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "5",
                                            "descriptor": {
                                                "name": "ICICI Direct Freelancers - ICICI Direct"
                                            },
                                            "location_ids": [
                                                "14"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "6",
                                            "descriptor": {
                                                "name": "Assembly Line Operator - Wistron"
                                            },
                                            "location_ids": [
                                                "15",
                                                "16"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "7",
                                            "descriptor": {
                                                "name": "CASA Marketing Associates - Karnataka Bank Limited"
                                            },
                                            "location_ids": [
                                                "17"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "8",
                                            "descriptor": {
                                                "name": "Telecaller - Fore Blend Infiscripts Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "18",
                                                "19"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "9",
                                            "descriptor": {
                                                "name": "NAPS Trainee - Avon Cycles "
                                            },
                                            "location_ids": [
                                                "20"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "10",
                                            "descriptor": {
                                                "name": "Production Trainee - SKH Metals Limited"
                                            },
                                            "location_ids": [
                                                "21"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "11",
                                            "descriptor": {
                                                "name": "NAPS Trainee - Daido India Pvt. Ltd"
                                            },
                                            "location_ids": [
                                                "22"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "12",
                                            "descriptor": {
                                                "name": "Production Trainee - Bharat Seats Ltd"
                                            },
                                            "location_ids": [
                                                "23",
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "13",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "25"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "14",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "26"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "15",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "27"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "16",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "28"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "17",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "29"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "18",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "30"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "19",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "31"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "20",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "32"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "21",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "33"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "22",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "34"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "23",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "35"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "24",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "36"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "25",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "37"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "26",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "38"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "27",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "39"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "28",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "40"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "29",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "41"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "30",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "42"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "31",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "43"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "32",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "44"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "33",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "45"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "34",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "46"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "35",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "47"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "36",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "48"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "37",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "49"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "38",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "50"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "39",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "51"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "40",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "52"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "41",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "53"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "42",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "54"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "43",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "55"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "44",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "56"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "45",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "57"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "46",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "58"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "47",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "59"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "48",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "60"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "49",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "61"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "50",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "62"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "51",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "63"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "52",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "64"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "53",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "65"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "54",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "66"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "55",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "67"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "56",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "68"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "57",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "69"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "58",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "70"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "59",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "71"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "60",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "72"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "61",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "73"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "62",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "74"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "63",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "75"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "64",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "76"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "77"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "66",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "78"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "67",
                                            "descriptor": {
                                                "name": "Sales Executives - Grasim Industries "
                                            },
                                            "location_ids": [
                                                "79"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "68",
                                            "descriptor": {
                                                "name": "Sales Executives - Grasim Industries "
                                            },
                                            "location_ids": [
                                                "80"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "69",
                                            "descriptor": {
                                                "name": "Sales Executives - Grasim Industries "
                                            },
                                            "location_ids": [
                                                "81"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "70",
                                            "descriptor": {
                                                "name": "Sales Executives - Grasim Industries "
                                            },
                                            "location_ids": [
                                                "82"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "71",
                                            "descriptor": {
                                                "name": "ITI Fitter  - PTC Industry Limited"
                                            },
                                            "location_ids": [
                                                "83"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "72",
                                            "descriptor": {
                                                "name": "Operator  - APTIV Components India Pvt. Ltd."
                                            },
                                            "location_ids": [
                                                "84"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "73",
                                            "descriptor": {
                                                "name": "Operator  - ARGL LIMITED"
                                            },
                                            "location_ids": [
                                                "85"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "74",
                                            "descriptor": {
                                                "name": "Operator  - ROKI MINDA"
                                            },
                                            "location_ids": [
                                                "86"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "75",
                                            "descriptor": {
                                                "name": "ITI - IntelliSmart Infrastructure Pvt. Ltd"
                                            },
                                            "location_ids": [
                                                "87"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "76",
                                            "descriptor": {
                                                "name": "Helper - IntelliSmart Infrastructure Pvt. Ltd"
                                            },
                                            "location_ids": [
                                                "88"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "77",
                                            "descriptor": {
                                                "name": "Data Entry - IntelliSmart Infrastructure Pvt. Ltd"
                                            },
                                            "location_ids": [
                                                "89"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "78",
                                            "descriptor": {
                                                "name": "Field Engg. - IntelliSmart Infrastructure Pvt. Ltd"
                                            },
                                            "location_ids": [
                                                "90"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "79",
                                            "descriptor": {
                                                "name": "Sales Executive - TATA Teleservices"
                                            },
                                            "location_ids": [
                                                "91"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "80",
                                            "descriptor": {
                                                "name": "Sales Asso. - Big FM"
                                            },
                                            "location_ids": [
                                                "92"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "81",
                                            "descriptor": {
                                                "name": "Sales Executive - Max publicity"
                                            },
                                            "location_ids": [
                                                "93"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "82",
                                            "descriptor": {
                                                "name": "Sales Executive - Luman"
                                            },
                                            "location_ids": [
                                                "94"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "83",
                                            "descriptor": {
                                                "name": "Telemarketing - Sheerdrive Private Limited"
                                            },
                                            "location_ids": [
                                                "95"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "84",
                                            "descriptor": {
                                                "name": "CAD Designer - HYOSUNG"
                                            },
                                            "location_ids": [
                                                "96"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "85",
                                            "descriptor": {
                                                "name": "Department Secretary/ Hr Generalist - Aker Solutions"
                                            },
                                            "location_ids": [
                                                "97"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "86",
                                            "descriptor": {
                                                "name": "Splicers,Asst Technicians, Sales and promoters, Customer care Executive - Reach Broadband"
                                            },
                                            "location_ids": [
                                                "98"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "87",
                                            "descriptor": {
                                                "name": "Splicers,Asst Technicians, Sales and promoters, Customer care Executive - Reach Broadband"
                                            },
                                            "location_ids": [
                                                "99"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "88",
                                            "descriptor": {
                                                "name": "Marketing - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "100"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "89",
                                            "descriptor": {
                                                "name": "Marketing - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "101"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "90",
                                            "descriptor": {
                                                "name": "Marketing - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "102"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "91",
                                            "descriptor": {
                                                "name": "Marketing - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "103"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "92",
                                            "descriptor": {
                                                "name": "Marketing - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "104"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "93",
                                            "descriptor": {
                                                "name": "Marketing - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "105"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "94",
                                            "descriptor": {
                                                "name": "Marketing - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "106"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "95",
                                            "descriptor": {
                                                "name": "Lab Assistant - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "107"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "96",
                                            "descriptor": {
                                                "name": "Lab Chemist - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "108"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "97",
                                            "descriptor": {
                                                "name": "Sales Executives - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "109"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "98",
                                            "descriptor": {
                                                "name": "Sales Head (Tile Adhesive) - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "110"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "99",
                                            "descriptor": {
                                                "name": "Sales Head (Tile Adhesive) - Surya Colour Products Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "111"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "100",
                                            "descriptor": {
                                                "name": "Business Development Executives - INDIGO Paints"
                                            },
                                            "location_ids": [
                                                "112",
                                                "113"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "101",
                                            "descriptor": {
                                                "name": "In Leagal Team - ABB"
                                            },
                                            "location_ids": [
                                                "114"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "102",
                                            "descriptor": {
                                                "name": "Blue collar workers female - Tata Electronics"
                                            },
                                            "location_ids": [
                                                "115"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "103",
                                            "descriptor": {
                                                "name": "engenieers and other - FirePro System"
                                            },
                                            "location_ids": [
                                                "116"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "104",
                                            "descriptor": {
                                                "name": "Office assistance - Essense Renewal"
                                            },
                                            "location_ids": [
                                                "117"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "105",
                                            "descriptor": {
                                                "name": "Property Advisor/ Tele Caller Sales - MagicBricks Reality Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "118"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "106",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "119"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "107",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "120"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "108",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "121"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "109",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "122"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "110",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "123"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "111",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "124"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "112",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "125"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "113",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "126"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "114",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "127"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "115",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "128"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "116",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "129"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "117",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "130"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "118",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "131"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "119",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "132"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "120",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "133"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "121",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "134"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "122",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "135"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "123",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "136"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "124",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "137"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "125",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "138"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "126",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "139"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "127",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "140"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "128",
                                            "descriptor": {
                                                "name": "Sales Executives - Luman Industries Ltd"
                                            },
                                            "location_ids": [
                                                "141"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "129",
                                            "descriptor": {
                                                "name": "Front Office/ Receptionist - CapitaLand Services Pvt Ltd"
                                            },
                                            "location_ids": [
                                                "142"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "130",
                                            "descriptor": {
                                                "name": "Sales Executives - Tejas Networks"
                                            },
                                            "location_ids": [
                                                "143"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "131",
                                            "descriptor": {
                                                "name": "Machine Operatpor - ITC Agribusiness"
                                            },
                                            "location_ids": [
                                                "144",
                                                "145"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "132",
                                            "descriptor": {
                                                "name": "sr technicians, jr technicians,QC Engineers,Floor Manager - Beepkart"
                                            },
                                            "location_ids": [
                                                "146"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "133",
                                            "descriptor": {
                                                "name": "Blue collar workers female - OLA"
                                            },
                                            "location_ids": [
                                                "147"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    "context": {
                        "domain": "onest:work-opportunities",
                        "action": "on_search",
                        "version": "1.1.0",
                        "bpp_id": "beckn-sandbox-bpp.becknprotocol.io",
                        "bpp_uri": "https://sandbox-bpp-network.becknprotocol.io/",
                        "country": "IND",
                        "city": "std:080",
                        "location": {
                            "country": {
                                "name": "India",
                                "code": "IND"
                            }
                        },
                        "bap_id": "jobs-bap.tekdinext.com",
                        "bap_uri": "https://jobs-bap.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60019",
                        "message_id": "3c6b273f-d1aa-43b4-9bb1-aa9b5f1d7443",
                        "ttl": "PT10M",
                        "timestamp": "2023-12-22T05:59:42.551Z"
                    },
                    "message": {
                        "catalog": {
                            "descriptor": {
                                "name": "Affindi Jobs"
                            },
                            "payments": [],
                            "providers": [
                                {
                                    "id": "1",
                                    "descriptor": {
                                        "name": "Affinidi"
                                    },
                                    "locations": [
                                        {
                                            "id": "1",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "2",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "4",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "5",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "5f6e21de6f7ed6b7a3259091194384ccbf290218e4c95d24a5ee8b59538fadf2",
                                            "descriptor": {
                                                "name": "Fullstack Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "D7F8606A370DA9966DF15E62A81C374B",
                                            "descriptor": {
                                                "name": "Database Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "0253719F295521CED39EC9C2F3C8DCDE",
                                            "descriptor": {
                                                "name": "Fullstack Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "e8eff1c9e63d87f41010c0e2ee7381ee3e06aaccfbc036fc2701e2f4e6461261",
                                            "descriptor": {
                                                "name": "Rojgar Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "1",
                                    "descriptor": {
                                        "name": "Affinidi"
                                    },
                                    "locations": [
                                        {
                                            "id": "1",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "2",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "4",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "5",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "5f6e21de6f7ed6b7a3259091194384ccbf290218e4c95d24a5ee8b59538fadf2",
                                            "descriptor": {
                                                "name": "Fullstack Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "D7F8606A370DA9966DF15E62A81C374B",
                                            "descriptor": {
                                                "name": "Database Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "0253719F295521CED39EC9C2F3C8DCDE",
                                            "descriptor": {
                                                "name": "Fullstack Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "e8eff1c9e63d87f41010c0e2ee7381ee3e06aaccfbc036fc2701e2f4e6461261",
                                            "descriptor": {
                                                "name": "Rojgar Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "2",
                                    "descriptor": {
                                        "name": "cognizant technology solutions"
                                    },
                                    "locations": [
                                        {
                                            "id": "3",
                                            "city": {
                                                "name": " kolkata"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "6",
                                            "city": {
                                                "name": " kolkata<br><br> ID created for your job!"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "6c3338c2574f092809d312c8b79ca9f8aea19794b6ffa356af952fdc9f1b21dd",
                                            "descriptor": {
                                                "name": "ui engineer",
                                                "long_desc": "ui engineer job by cognizant technology solutions on Rojgaar"
                                            },
                                            "location_ids": [
                                                "3"
                                            ]
                                        },
                                        {
                                            "id": "6868ca2ab59d0f4b73b062a12fcfbb0fe36a3f92e4f566e1842afccf63fb9b22",
                                            "descriptor": {
                                                "name": "ui engineer",
                                                "long_desc": "ui engineer job by cognizant technology solutions on Rojgaar"
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "1",
                                    "descriptor": {
                                        "name": "Affinidi"
                                    },
                                    "locations": [
                                        {
                                            "id": "1",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "2",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "4",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "5",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "5f6e21de6f7ed6b7a3259091194384ccbf290218e4c95d24a5ee8b59538fadf2",
                                            "descriptor": {
                                                "name": "Fullstack Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "D7F8606A370DA9966DF15E62A81C374B",
                                            "descriptor": {
                                                "name": "Database Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "0253719F295521CED39EC9C2F3C8DCDE",
                                            "descriptor": {
                                                "name": "Fullstack Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "e8eff1c9e63d87f41010c0e2ee7381ee3e06aaccfbc036fc2701e2f4e6461261",
                                            "descriptor": {
                                                "name": "Rojgar Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "1",
                                    "descriptor": {
                                        "name": "Affinidi"
                                    },
                                    "locations": [
                                        {
                                            "id": "1",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "2",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "4",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "5",
                                            "city": {
                                                "name": "Bangalore"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "5f6e21de6f7ed6b7a3259091194384ccbf290218e4c95d24a5ee8b59538fadf2",
                                            "descriptor": {
                                                "name": "Fullstack Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "D7F8606A370DA9966DF15E62A81C374B",
                                            "descriptor": {
                                                "name": "Database Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "0253719F295521CED39EC9C2F3C8DCDE",
                                            "descriptor": {
                                                "name": "Fullstack Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "e8eff1c9e63d87f41010c0e2ee7381ee3e06aaccfbc036fc2701e2f4e6461261",
                                            "descriptor": {
                                                "name": "Rojgar Engineer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "2",
                                    "descriptor": {
                                        "name": "cognizant technology solutions"
                                    },
                                    "locations": [
                                        {
                                            "id": "3",
                                            "city": {
                                                "name": " kolkata"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "6",
                                            "city": {
                                                "name": " kolkata<br><br> ID created for your job!"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "6c3338c2574f092809d312c8b79ca9f8aea19794b6ffa356af952fdc9f1b21dd",
                                            "descriptor": {
                                                "name": "ui engineer",
                                                "long_desc": "ui engineer job by cognizant technology solutions on Rojgaar"
                                            },
                                            "location_ids": [
                                                "3"
                                            ]
                                        },
                                        {
                                            "id": "6868ca2ab59d0f4b73b062a12fcfbb0fe36a3f92e4f566e1842afccf63fb9b22",
                                            "descriptor": {
                                                "name": "ui engineer",
                                                "long_desc": "ui engineer job by cognizant technology solutions on Rojgaar"
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            ]
        }

        let arrayOfObjects = []
        for (const responses of data.responses) {
            console.log("===1128===")
            //if()
            for (const providers of responses.message.catalog.providers) {
                console.log("===1130===", providers.locations)
                for (const [index, item] of providers.items.entries()) {
                    console.log("===1132===")
                    let obj = {

                        item_id: item.id,
                        title: item.descriptor.name,
                        //description: item.descriptor.long_desc,
                        location_id: item.location_ids[0],
                        //city: providers.locations.find(item => item.id === items.location_ids[0]) ? providers.locations.find(item => item.id === items.location_ids[0]).city.name : null,
                        city: providers.locations[index].city.name,
                        state: providers.locations[index].state.name,
                        //country: providers.locations[index].country.name,
                        provider_id: providers.id,
                        provider_name: providers.descriptor.name,
                        bpp_id: responses.context.bpp_id,
                        bpp_uri: responses.context.bpp_uri

                    }
                    arrayOfObjects.push(obj)
                }

            }

        }
        console.log("arrayOfObjects", arrayOfObjects)
        //return arrayOfObjects
        return this.hasuraService.insertCacheData(arrayOfObjects)
    }

    async getState() {
        return this.hasuraService.getState();
    }

    async getCity(state: string) {
        return this.hasuraService.getCity(state);
    }

    async getTitle() {
        return this.hasuraService.getTitle();
    }

    async getFilterData(data) {
        return this.hasuraService.getFilterData(data);
    }

    async deleteResponse() {
        return this.hasuraService.deleteResponse();
    }

    async deleteJobs() {
        return this.hasuraService.deleteJobs();
    }


}
