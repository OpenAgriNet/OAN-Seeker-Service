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
                "timestamp": "2024-02-15T03:36:40.969Z",
                "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                "domain": "onest:work-opportunities",
                "version": "1.1.0",
                "bap_id": "jobs-bap-dev.tekdinext.com",
                "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
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
                        "bpp_id": "dev.sahi1.online",
                        "bpp_uri": "https://dev.sahi1.online/",
                        "country": "IND",
                        "city": "std:080",
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:47.533Z"
                    },
                    "message": {
                        "catalog": {
                            "descriptor": {
                                "name": "Sahi Jobs",
                                "short_desc": "short desp",
                                "images": []
                            },
                            "providers": [
                                {
                                    "id": "dev.sahi1.online",
                                    "descriptor": {
                                        "name": "Sahi Jobs",
                                        "short_desc": "short desp",
                                        "images": []
                                    },
                                    "fulfillments": [
                                        {
                                            "id": "1",
                                            "type": "remote",
                                            "tracking": false
                                        }
                                    ],
                                    "locations": [
                                        {
                                            "id": "L1",
                                            "city": {
                                                "name": "Alappuzha",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L2",
                                            "city": {
                                                "name": "Ahmedabad",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "GUJARAT",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L3",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KARNATAKA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L4",
                                            "city": {
                                                "name": "Coimbatore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "TAMIL NADU",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L5",
                                            "city": {
                                                "name": "Ernakulam",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "6543851a0f5ef5f799705b32",
                                            "descriptor": {
                                                "name": "Service Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L1"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65782e1ae50b97b52eebc499",
                                            "descriptor": {
                                                "name": "Promoters",
                                                "long_desc": "Promoting Amazon pay to The Auto rickshaws drivers to use it\ncashless benefits\nfield work\nC2C "
                                            },
                                            "location_ids": [
                                                "L2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "659791405040d97b2ab615fa",
                                            "descriptor": {
                                                "name": "Inside Sales Excutive",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L3"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65ad0e8c4021c783142c9cce",
                                            "descriptor": {
                                                "name": "Brand Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L4"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65c30d1e8d2cd84b77814682",
                                            "descriptor": {
                                                "name": "Cafetaria Manager",
                                                "long_desc": "Job"
                                            },
                                            "location_ids": [
                                                "L5"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "payments": []
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
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:48.748Z"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "2",
                                    "descriptor": {
                                        "name": "test"
                                    },
                                    "locations": [
                                        {
                                            "id": "3",
                                            "city": {
                                                "name": "Mumbai"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "8",
                                            "city": {
                                                "name": "test"
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
                                            "id": "424587a9b09d1c3edbc06087fc39aa8546be81ed788cb0698509e9e4be2272c6",
                                            "descriptor": {
                                                "name": "Developer",
                                                "long_desc": "Develop code"
                                            },
                                            "location_ids": [
                                                "3"
                                            ]
                                        },
                                        {
                                            "id": "2b86f151821a60b8462a2e9462cc05120d05ffbc48ccac1c30774cec236a74f5",
                                            "descriptor": {
                                                "name": "Staff Mobile Developer - test",
                                                "long_desc": "test"
                                            },
                                            "location_ids": [
                                                "8"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "2",
                                    "descriptor": {
                                        "name": "test"
                                    },
                                    "locations": [
                                        {
                                            "id": "3",
                                            "city": {
                                                "name": "Mumbai"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "8",
                                            "city": {
                                                "name": "test"
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
                                            "id": "424587a9b09d1c3edbc06087fc39aa8546be81ed788cb0698509e9e4be2272c6",
                                            "descriptor": {
                                                "name": "Developer",
                                                "long_desc": "Develop code"
                                            },
                                            "location_ids": [
                                                "3"
                                            ]
                                        },
                                        {
                                            "id": "2b86f151821a60b8462a2e9462cc05120d05ffbc48ccac1c30774cec236a74f5",
                                            "descriptor": {
                                                "name": "Staff Mobile Developer - test",
                                                "long_desc": "test"
                                            },
                                            "location_ids": [
                                                "8"
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
                        "bpp_id": "dev.sahi1.online",
                        "bpp_uri": "https://dev.sahi1.online/",
                        "country": "IND",
                        "city": "std:080",
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:50.683Z"
                    },
                    "message": {
                        "catalog": {
                            "descriptor": {
                                "name": "Sahi Jobs",
                                "short_desc": "short desp",
                                "images": []
                            },
                            "providers": [
                                {
                                    "id": "dev.sahi1.online",
                                    "descriptor": {
                                        "name": "Sahi Jobs",
                                        "short_desc": "short desp",
                                        "images": []
                                    },
                                    "fulfillments": [
                                        {
                                            "id": "1",
                                            "type": "remote",
                                            "tracking": false
                                        }
                                    ],
                                    "locations": [
                                        {
                                            "id": "L1",
                                            "city": {
                                                "name": "Alappuzha",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L2",
                                            "city": {
                                                "name": "Ahmedabad",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "GUJARAT",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L3",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KARNATAKA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L4",
                                            "city": {
                                                "name": "Coimbatore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "TAMIL NADU",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L5",
                                            "city": {
                                                "name": "Ernakulam",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "6543851a0f5ef5f799705b32",
                                            "descriptor": {
                                                "name": "Service Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L1"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65782e1ae50b97b52eebc499",
                                            "descriptor": {
                                                "name": "Promoters",
                                                "long_desc": "Promoting Amazon pay to The Auto rickshaws drivers to use it\ncashless benefits\nfield work\nC2C "
                                            },
                                            "location_ids": [
                                                "L2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "659791405040d97b2ab615fa",
                                            "descriptor": {
                                                "name": "Inside Sales Excutive",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L3"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65ad0e8c4021c783142c9cce",
                                            "descriptor": {
                                                "name": "Brand Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L4"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65c30d1e8d2cd84b77814682",
                                            "descriptor": {
                                                "name": "Cafetaria Manager",
                                                "long_desc": "Job"
                                            },
                                            "location_ids": [
                                                "L5"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "payments": []
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
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:48.748Z"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "2",
                                    "descriptor": {
                                        "name": "test"
                                    },
                                    "locations": [
                                        {
                                            "id": "3",
                                            "city": {
                                                "name": "Mumbai"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "8",
                                            "city": {
                                                "name": "test"
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
                                            "id": "424587a9b09d1c3edbc06087fc39aa8546be81ed788cb0698509e9e4be2272c6",
                                            "descriptor": {
                                                "name": "Developer",
                                                "long_desc": "Develop code"
                                            },
                                            "location_ids": [
                                                "3"
                                            ]
                                        },
                                        {
                                            "id": "2b86f151821a60b8462a2e9462cc05120d05ffbc48ccac1c30774cec236a74f5",
                                            "descriptor": {
                                                "name": "Staff Mobile Developer - test",
                                                "long_desc": "test"
                                            },
                                            "location_ids": [
                                                "8"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
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
                                        },
                                        {
                                            "id": "6",
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
                                            "id": "7",
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
                                            "id": "08282D2ED9D1A22571DF114E58EA8B70",
                                            "descriptor": {
                                                "name": "Mobile application Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "B29ACB6CD4AB1D02A210F15AC070205F",
                                            "descriptor": {
                                                "name": "Database Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "2"
                                            ]
                                        },
                                        {
                                            "id": "FCB4FB0798490F195E703AD75E0B775C",
                                            "descriptor": {
                                                "name": "Fullstack Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "4"
                                            ]
                                        },
                                        {
                                            "id": "a1a37f3be54e432b50aed78aa3cb16e4a4f592ee02387cd6815d1dfff285c0f1",
                                            "descriptor": {
                                                "name": "Pyhton Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "5"
                                            ]
                                        },
                                        {
                                            "id": "ac8bfcb77612a9817cbb06902a4b076776608726e0fcdd6b0665133789da69eb",
                                            "descriptor": {
                                                "name": "Andorid Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "6"
                                            ]
                                        },
                                        {
                                            "id": "5a2d0f05fe2890ce5040d8c00298902aed7a8398e487017287211614888c532a",
                                            "descriptor": {
                                                "name": "IOS Developer",
                                                "long_desc": "We’re on a search for a Staff Mobile Developer with the following attributes: Critical Thinking- You are able to skillfully conceptualise, apply, analyse and evaluate information gathered from observation, experience or communication and use it as a guide to action Data-Driven attitude — You often propose solutions or make a point in a logical and objective manner, substantiated with accurate data and evidence Dealing with Ambiguity — You can effectively cope with change and uncertainty, and are comfortable when things are up in the air Goal-oriented — You are driven and can be counted on to exceed goals. You steadfastly push yourself and others to achieve results all the time Problem Solving — You can easily identify and solve complex problems in a methodological manner "
                                            },
                                            "location_ids": [
                                                "7"
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "id": "2",
                                    "descriptor": {
                                        "name": "test"
                                    },
                                    "locations": [
                                        {
                                            "id": "3",
                                            "city": {
                                                "name": "Mumbai"
                                            },
                                            "state": {
                                                "name": ""
                                            },
                                            "country": {
                                                "name": ""
                                            }
                                        },
                                        {
                                            "id": "8",
                                            "city": {
                                                "name": "test"
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
                                            "id": "424587a9b09d1c3edbc06087fc39aa8546be81ed788cb0698509e9e4be2272c6",
                                            "descriptor": {
                                                "name": "Developer",
                                                "long_desc": "Develop code"
                                            },
                                            "location_ids": [
                                                "3"
                                            ]
                                        },
                                        {
                                            "id": "2b86f151821a60b8462a2e9462cc05120d05ffbc48ccac1c30774cec236a74f5",
                                            "descriptor": {
                                                "name": "Staff Mobile Developer - test",
                                                "long_desc": "test"
                                            },
                                            "location_ids": [
                                                "8"
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
                        "bpp_id": "dev.sahi1.online",
                        "bpp_uri": "https://dev.sahi1.online/",
                        "country": "IND",
                        "city": "std:080",
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:47.533Z"
                    },
                    "message": {
                        "catalog": {
                            "descriptor": {
                                "name": "Sahi Jobs",
                                "short_desc": "short desp",
                                "images": []
                            },
                            "providers": [
                                {
                                    "id": "dev.sahi1.online",
                                    "descriptor": {
                                        "name": "Sahi Jobs",
                                        "short_desc": "short desp",
                                        "images": []
                                    },
                                    "fulfillments": [
                                        {
                                            "id": "1",
                                            "type": "remote",
                                            "tracking": false
                                        }
                                    ],
                                    "locations": [
                                        {
                                            "id": "L1",
                                            "city": {
                                                "name": "Alappuzha",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L2",
                                            "city": {
                                                "name": "Ahmedabad",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "GUJARAT",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L3",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KARNATAKA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L4",
                                            "city": {
                                                "name": "Coimbatore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "TAMIL NADU",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L5",
                                            "city": {
                                                "name": "Ernakulam",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "6543851a0f5ef5f799705b32",
                                            "descriptor": {
                                                "name": "Service Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L1"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65782e1ae50b97b52eebc499",
                                            "descriptor": {
                                                "name": "Promoters",
                                                "long_desc": "Promoting Amazon pay to The Auto rickshaws drivers to use it\ncashless benefits\nfield work\nC2C "
                                            },
                                            "location_ids": [
                                                "L2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "659791405040d97b2ab615fa",
                                            "descriptor": {
                                                "name": "Inside Sales Excutive",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L3"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65ad0e8c4021c783142c9cce",
                                            "descriptor": {
                                                "name": "Brand Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L4"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65c30d1e8d2cd84b77814682",
                                            "descriptor": {
                                                "name": "Cafetaria Manager",
                                                "long_desc": "Job"
                                            },
                                            "location_ids": [
                                                "L5"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "payments": []
                        }
                    }
                },
                {
                    "context": {
                        "domain": "onest:work-opportunities",
                        "action": "on_search",
                        "version": "1.1.0",
                        "bpp_id": "dev.sahi1.online",
                        "bpp_uri": "https://dev.sahi1.online/",
                        "country": "IND",
                        "city": "std:080",
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:50.683Z"
                    },
                    "message": {
                        "catalog": {
                            "descriptor": {
                                "name": "Sahi Jobs",
                                "short_desc": "short desp",
                                "images": []
                            },
                            "providers": [
                                {
                                    "id": "dev.sahi1.online",
                                    "descriptor": {
                                        "name": "Sahi Jobs",
                                        "short_desc": "short desp",
                                        "images": []
                                    },
                                    "fulfillments": [
                                        {
                                            "id": "1",
                                            "type": "remote",
                                            "tracking": false
                                        }
                                    ],
                                    "locations": [
                                        {
                                            "id": "L1",
                                            "city": {
                                                "name": "Alappuzha",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L2",
                                            "city": {
                                                "name": "Ahmedabad",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "GUJARAT",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L3",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KARNATAKA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L4",
                                            "city": {
                                                "name": "Coimbatore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "TAMIL NADU",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L5",
                                            "city": {
                                                "name": "Ernakulam",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "6543851a0f5ef5f799705b32",
                                            "descriptor": {
                                                "name": "Service Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L1"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65782e1ae50b97b52eebc499",
                                            "descriptor": {
                                                "name": "Promoters",
                                                "long_desc": "Promoting Amazon pay to The Auto rickshaws drivers to use it\ncashless benefits\nfield work\nC2C "
                                            },
                                            "location_ids": [
                                                "L2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "659791405040d97b2ab615fa",
                                            "descriptor": {
                                                "name": "Inside Sales Excutive",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L3"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65ad0e8c4021c783142c9cce",
                                            "descriptor": {
                                                "name": "Brand Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L4"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65c30d1e8d2cd84b77814682",
                                            "descriptor": {
                                                "name": "Cafetaria Manager",
                                                "long_desc": "Job"
                                            },
                                            "location_ids": [
                                                "L5"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "payments": []
                        }
                    }
                },
                {
                    "context": {
                        "domain": "onest:work-opportunities",
                        "action": "on_search",
                        "version": "1.1.0",
                        "bpp_id": "dev.sahi1.online",
                        "bpp_uri": "https://dev.sahi1.online/",
                        "country": "IND",
                        "city": "std:080",
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:54.206Z"
                    },
                    "message": {
                        "catalog": {
                            "descriptor": {
                                "name": "Sahi Jobs",
                                "short_desc": "short desp",
                                "images": []
                            },
                            "providers": [
                                {
                                    "id": "dev.sahi1.online",
                                    "descriptor": {
                                        "name": "Sahi Jobs",
                                        "short_desc": "short desp",
                                        "images": []
                                    },
                                    "fulfillments": [
                                        {
                                            "id": "1",
                                            "type": "remote",
                                            "tracking": false
                                        }
                                    ],
                                    "locations": [
                                        {
                                            "id": "L1",
                                            "city": {
                                                "name": "Alappuzha",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L2",
                                            "city": {
                                                "name": "Ahmedabad",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "GUJARAT",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L3",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KARNATAKA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L4",
                                            "city": {
                                                "name": "Coimbatore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "TAMIL NADU",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L5",
                                            "city": {
                                                "name": "Ernakulam",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "6543851a0f5ef5f799705b32",
                                            "descriptor": {
                                                "name": "Service Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L1"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65782e1ae50b97b52eebc499",
                                            "descriptor": {
                                                "name": "Promoters",
                                                "long_desc": "Promoting Amazon pay to The Auto rickshaws drivers to use it\ncashless benefits\nfield work\nC2C "
                                            },
                                            "location_ids": [
                                                "L2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "659791405040d97b2ab615fa",
                                            "descriptor": {
                                                "name": "Inside Sales Excutive",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L3"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65ad0e8c4021c783142c9cce",
                                            "descriptor": {
                                                "name": "Brand Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L4"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65c30d1e8d2cd84b77814682",
                                            "descriptor": {
                                                "name": "Cafetaria Manager",
                                                "long_desc": "Job"
                                            },
                                            "location_ids": [
                                                "L5"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "payments": []
                        }
                    }
                },
                {
                    "context": {
                        "domain": "onest:work-opportunities",
                        "action": "on_search",
                        "version": "1.1.0",
                        "bpp_id": "dev-onest.tibilprojects.com",
                        "bpp_uri": "https://dev-onest.tibilprojects.com/protocol-network",
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
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:52.398Z"
                    },
                    "message": {
                        "catalog": {
                            "providers": [
                                {
                                    "id": "1",
                                    "descriptor": {
                                        "name": "tibil"
                                    },
                                    "locations": [
                                        {
                                            "id": "23",
                                            "city": {
                                                "code": "std:04344",
                                                "name": "Hosur"
                                            },
                                            "state": {
                                                "code": "TN",
                                                "name": "Tamil Nadu"
                                            }
                                        },
                                        {
                                            "id": "3",
                                            "city": {
                                                "code": "std:0512",
                                                "name": "Kanpur"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "4",
                                            "city": {
                                                "code": "std:0522",
                                                "name": "Lucknow"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "5",
                                            "city": {
                                                "code": "std:0542",
                                                "name": "Varanasi"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "6",
                                            "city": {
                                                "code": "std:011",
                                                "name": "Delhi"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "7",
                                            "city": {
                                                "code": "std:022",
                                                "name": "Mumbai"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "8",
                                            "city": {
                                                "code": "std:020",
                                                "name": "Pune"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "9",
                                            "city": {
                                                "code": "std:040",
                                                "name": "Hyderabad"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "10",
                                            "city": {
                                                "code": "std:08922",
                                                "name": "Vizayanagaram"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "11",
                                            "city": {
                                                "code": "std:044",
                                                "name": "Chennai"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "12",
                                            "city": {
                                                "code": "std:080",
                                                "name": "Bengaluru"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "13",
                                            "city": {
                                                "name": "Mysore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "14",
                                            "city": {
                                                "code": "std:0836",
                                                "name": "Hubli"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "15",
                                            "city": {
                                                "name": "Tumkur",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "16",
                                            "city": {
                                                "name": "Jharkh",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "17",
                                            "city": {
                                                "name": "Bihar",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "18",
                                            "city": {
                                                "name": "Orissa",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "19",
                                            "city": {
                                                "code": "std:0141",
                                                "name": "Jaipur"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "20",
                                            "city": {
                                                "name": "Gujarat",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "21",
                                            "city": {
                                                "code": "std:0755",
                                                "name": "Bhopal"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "22",
                                            "city": {
                                                "name": "4 Sahayaks per geography)",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "1",
                                            "city": {
                                                "code": "std:08152",
                                                "name": "Kolar"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "2",
                                            "city": {
                                                "name": "Karnataka",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "23",
                                            "city": {
                                                "code": "std:04344",
                                                "name": "Hosur"
                                            },
                                            "state": {
                                                "code": "TN",
                                                "name": "Tamil Nadu"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "25",
                                            "city": {
                                                "name": "Koramangala",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "26",
                                            "city": {
                                                "code": "std:0120",
                                                "name": "Greater Noida"
                                            },
                                            "state": {
                                                "code": "UP",
                                                "name": "Uttar Pradesh"
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
                                            "id": "3",
                                            "descriptor": {
                                                "name": "Blue collar workers female",
                                                "long_desc": "Technician"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Tata Electronics"
                                                }
                                            },
                                            "location_ids": [
                                                "23"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Under Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "40"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "2",
                                            "descriptor": {
                                                "name": "Sahayak's",
                                                "long_desc": "Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India."
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Jeevitam Sahayaks"
                                                }
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
                                                "12",
                                                "13",
                                                "14",
                                                "15",
                                                "16",
                                                "17",
                                                "18",
                                                "19",
                                                "20",
                                                "21",
                                                "22"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "8th Pass"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "55"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "1",
                                            "descriptor": {
                                                "name": "Assembly Line Operator",
                                                "long_desc": "Assemble the Mobile Phone Quality Inspection Quality Management"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Wistron"
                                                }
                                            },
                                            "location_ids": [
                                                "1",
                                                "2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Diploma"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "ITI"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Female"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "26"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "4",
                                            "descriptor": {
                                                "name": "Blue collar workers female",
                                                "long_desc": "OLA Electric bike Manufacturing"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "OLA"
                                                }
                                            },
                                            "location_ids": [
                                                "23"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "12th pass +"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "16000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "18000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "40"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "6",
                                            "descriptor": {
                                                "name": "Telecaller",
                                                "long_desc": "1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred "
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Fore Blend Infiscripts Pvt Ltd"
                                                }
                                            },
                                            "location_ids": [
                                                "25",
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "15000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "20000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "25"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "20"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "5",
                                            "descriptor": {
                                                "name": "Customer Support/Credit Card Sales/BPO",
                                                "long_desc": "Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Vindhya E-Infomedia Pvt Ltd"
                                                }
                                            },
                                            "location_ids": [
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "2"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "10th Pass"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "13000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "18000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "35"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": "Good communication skills in english and hindi"
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "7",
                                            "descriptor": {
                                                "name": "BDE/CIC",
                                                "long_desc": "Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Just Dial"
                                                }
                                            },
                                            "location_ids": [
                                                "26"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "2"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "18000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "30000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "35"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": "communication skills in  hindi"
                                                        }
                                                    ],
                                                    "display": true
                                                }
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
                        "bpp_id": "dev.sahi1.online",
                        "bpp_uri": "https://dev.sahi1.online/",
                        "country": "IND",
                        "city": "std:080",
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:47.533Z"
                    },
                    "message": {
                        "catalog": {
                            "descriptor": {
                                "name": "Sahi Jobs",
                                "short_desc": "short desp",
                                "images": []
                            },
                            "providers": [
                                {
                                    "id": "dev.sahi1.online",
                                    "descriptor": {
                                        "name": "Sahi Jobs",
                                        "short_desc": "short desp",
                                        "images": []
                                    },
                                    "fulfillments": [
                                        {
                                            "id": "1",
                                            "type": "remote",
                                            "tracking": false
                                        }
                                    ],
                                    "locations": [
                                        {
                                            "id": "L1",
                                            "city": {
                                                "name": "Alappuzha",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L2",
                                            "city": {
                                                "name": "Ahmedabad",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "GUJARAT",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L3",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KARNATAKA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L4",
                                            "city": {
                                                "name": "Coimbatore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "TAMIL NADU",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L5",
                                            "city": {
                                                "name": "Ernakulam",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "6543851a0f5ef5f799705b32",
                                            "descriptor": {
                                                "name": "Service Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L1"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65782e1ae50b97b52eebc499",
                                            "descriptor": {
                                                "name": "Promoters",
                                                "long_desc": "Promoting Amazon pay to The Auto rickshaws drivers to use it\ncashless benefits\nfield work\nC2C "
                                            },
                                            "location_ids": [
                                                "L2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "659791405040d97b2ab615fa",
                                            "descriptor": {
                                                "name": "Inside Sales Excutive",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L3"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65ad0e8c4021c783142c9cce",
                                            "descriptor": {
                                                "name": "Brand Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L4"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65c30d1e8d2cd84b77814682",
                                            "descriptor": {
                                                "name": "Cafetaria Manager",
                                                "long_desc": "Job"
                                            },
                                            "location_ids": [
                                                "L5"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "payments": []
                        }
                    }
                },
                {
                    "context": {
                        "domain": "onest:work-opportunities",
                        "action": "on_search",
                        "version": "1.1.0",
                        "bpp_id": "dev-onest.tibilprojects.com",
                        "bpp_uri": "https://dev-onest.tibilprojects.com/protocol-network",
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
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:56.442Z"
                    },
                    "message": {
                        "catalog": {
                            "providers": [
                                {
                                    "id": "1",
                                    "descriptor": {
                                        "name": "tibil"
                                    },
                                    "locations": [
                                        {
                                            "id": "23",
                                            "city": {
                                                "code": "std:04344",
                                                "name": "Hosur"
                                            },
                                            "state": {
                                                "code": "TN",
                                                "name": "Tamil Nadu"
                                            }
                                        },
                                        {
                                            "id": "3",
                                            "city": {
                                                "code": "std:0512",
                                                "name": "Kanpur"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "4",
                                            "city": {
                                                "code": "std:0522",
                                                "name": "Lucknow"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "5",
                                            "city": {
                                                "code": "std:0542",
                                                "name": "Varanasi"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "6",
                                            "city": {
                                                "code": "std:011",
                                                "name": "Delhi"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "7",
                                            "city": {
                                                "code": "std:022",
                                                "name": "Mumbai"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "8",
                                            "city": {
                                                "code": "std:020",
                                                "name": "Pune"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "9",
                                            "city": {
                                                "code": "std:040",
                                                "name": "Hyderabad"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "10",
                                            "city": {
                                                "code": "std:08922",
                                                "name": "Vizayanagaram"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "11",
                                            "city": {
                                                "code": "std:044",
                                                "name": "Chennai"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "12",
                                            "city": {
                                                "code": "std:080",
                                                "name": "Bengaluru"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "13",
                                            "city": {
                                                "name": "Mysore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "14",
                                            "city": {
                                                "code": "std:0836",
                                                "name": "Hubli"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "15",
                                            "city": {
                                                "name": "Tumkur",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "16",
                                            "city": {
                                                "name": "Jharkh",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "17",
                                            "city": {
                                                "name": "Bihar",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "18",
                                            "city": {
                                                "name": "Orissa",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "19",
                                            "city": {
                                                "code": "std:0141",
                                                "name": "Jaipur"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "20",
                                            "city": {
                                                "name": "Gujarat",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "21",
                                            "city": {
                                                "code": "std:0755",
                                                "name": "Bhopal"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "22",
                                            "city": {
                                                "name": "4 Sahayaks per geography)",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "1",
                                            "city": {
                                                "code": "std:08152",
                                                "name": "Kolar"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "2",
                                            "city": {
                                                "name": "Karnataka",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "23",
                                            "city": {
                                                "code": "std:04344",
                                                "name": "Hosur"
                                            },
                                            "state": {
                                                "code": "TN",
                                                "name": "Tamil Nadu"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "25",
                                            "city": {
                                                "name": "Koramangala",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "26",
                                            "city": {
                                                "code": "std:0120",
                                                "name": "Greater Noida"
                                            },
                                            "state": {
                                                "code": "UP",
                                                "name": "Uttar Pradesh"
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
                                            "id": "3",
                                            "descriptor": {
                                                "name": "Blue collar workers female",
                                                "long_desc": "Technician"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Tata Electronics"
                                                }
                                            },
                                            "location_ids": [
                                                "23"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Under Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "40"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "2",
                                            "descriptor": {
                                                "name": "Sahayak's",
                                                "long_desc": "Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India."
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Jeevitam Sahayaks"
                                                }
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
                                                "12",
                                                "13",
                                                "14",
                                                "15",
                                                "16",
                                                "17",
                                                "18",
                                                "19",
                                                "20",
                                                "21",
                                                "22"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "8th Pass"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "55"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "1",
                                            "descriptor": {
                                                "name": "Assembly Line Operator",
                                                "long_desc": "Assemble the Mobile Phone Quality Inspection Quality Management"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Wistron"
                                                }
                                            },
                                            "location_ids": [
                                                "1",
                                                "2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Diploma"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "ITI"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Female"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "26"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "4",
                                            "descriptor": {
                                                "name": "Blue collar workers female",
                                                "long_desc": "OLA Electric bike Manufacturing"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "OLA"
                                                }
                                            },
                                            "location_ids": [
                                                "23"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "12th pass +"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "16000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "18000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "40"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "6",
                                            "descriptor": {
                                                "name": "Telecaller",
                                                "long_desc": "1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred "
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Fore Blend Infiscripts Pvt Ltd"
                                                }
                                            },
                                            "location_ids": [
                                                "25",
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "15000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "20000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "25"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "20"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "5",
                                            "descriptor": {
                                                "name": "Customer Support/Credit Card Sales/BPO",
                                                "long_desc": "Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Vindhya E-Infomedia Pvt Ltd"
                                                }
                                            },
                                            "location_ids": [
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "2"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "10th Pass"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "13000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "18000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "35"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": "Good communication skills in english and hindi"
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "7",
                                            "descriptor": {
                                                "name": "BDE/CIC",
                                                "long_desc": "Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Just Dial"
                                                }
                                            },
                                            "location_ids": [
                                                "26"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "2"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "18000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "30000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "35"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": "communication skills in  hindi"
                                                        }
                                                    ],
                                                    "display": true
                                                }
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
                        "bpp_id": "dev.sahi1.online",
                        "bpp_uri": "https://dev.sahi1.online/",
                        "country": "IND",
                        "city": "std:080",
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:50.683Z"
                    },
                    "message": {
                        "catalog": {
                            "descriptor": {
                                "name": "Sahi Jobs",
                                "short_desc": "short desp",
                                "images": []
                            },
                            "providers": [
                                {
                                    "id": "dev.sahi1.online",
                                    "descriptor": {
                                        "name": "Sahi Jobs",
                                        "short_desc": "short desp",
                                        "images": []
                                    },
                                    "fulfillments": [
                                        {
                                            "id": "1",
                                            "type": "remote",
                                            "tracking": false
                                        }
                                    ],
                                    "locations": [
                                        {
                                            "id": "L1",
                                            "city": {
                                                "name": "Alappuzha",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L2",
                                            "city": {
                                                "name": "Ahmedabad",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "GUJARAT",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L3",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KARNATAKA",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L4",
                                            "city": {
                                                "name": "Coimbatore",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "TAMIL NADU",
                                                "code": ""
                                            }
                                        },
                                        {
                                            "id": "L5",
                                            "city": {
                                                "name": "Ernakulam",
                                                "code": ""
                                            },
                                            "state": {
                                                "name": "KERALA",
                                                "code": ""
                                            }
                                        }
                                    ],
                                    "items": [
                                        {
                                            "id": "6543851a0f5ef5f799705b32",
                                            "descriptor": {
                                                "name": "Service Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L1"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65782e1ae50b97b52eebc499",
                                            "descriptor": {
                                                "name": "Promoters",
                                                "long_desc": "Promoting Amazon pay to The Auto rickshaws drivers to use it\ncashless benefits\nfield work\nC2C "
                                            },
                                            "location_ids": [
                                                "L2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "659791405040d97b2ab615fa",
                                            "descriptor": {
                                                "name": "Inside Sales Excutive",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L3"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65ad0e8c4021c783142c9cce",
                                            "descriptor": {
                                                "name": "Brand Champion",
                                                "long_desc": "1 Customer Handling ● Receiving customer with smile and greet him with Politeness, courteousness and professionalism ● Verify the service requests made by customers & Capture VOC of the customer and update in the system ● Conversational skill for telephonic as well as face to face discussion ● Customer communications about repair updates 2 Diagnosis ● Analyse and Diagnose the Scooter to identify number and type of repairs applicable ● Update the diagnosis report in the WMS (Getafix) ● Perform repairs & final inspection on the vehicle if the desired repairs as per the customer Voice is performed 3 System Handling ● Track the Customer complaint in Zendesk and update the system on live basis ● Operate Workshop Management System (Getafix) and ensure 100 % adherence ● Update operational Status and ETA on timely basis in both CRM and WMS systems ● Check for scooter health in Telematics Command centre for deep diagnosis 4 Technical Repairs ● Service Champion should be fully equipped with knowledge on OLA Scooter ● Could able to repair/replace all the parts of the scooter ● Ensure he/she is updated on OLA technical curricular, news bulletin on EV 5 Process and Operational ● Process adherence at Experience Centre and also ensure bays are clearly marked for Vehicle/Scooters. ● Invoicing and Payment Collections ● Ensure bays are free from any foreign materials and fit for serviceability 6 Parts Operation ● Auditing the inventory and ensure system and physical inventory is same ● Perform GRN and maintain Inventory at Experience Centre ● Ensuring Warranty part reverse logistics to the Mother workshop"
                                            },
                                            "location_ids": [
                                                "L4"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        },
                                        {
                                            "id": "65c30d1e8d2cd84b77814682",
                                            "descriptor": {
                                                "name": "Cafetaria Manager",
                                                "long_desc": "Job"
                                            },
                                            "location_ids": [
                                                "L5"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "payments": []
                        }
                    }
                },
                {
                    "context": {
                        "domain": "onest:work-opportunities",
                        "action": "on_search",
                        "version": "1.1.0",
                        "bpp_id": "dev-onest.tibilprojects.com",
                        "bpp_uri": "https://dev-onest.tibilprojects.com/protocol-network",
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
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:52.398Z"
                    },
                    "message": {
                        "catalog": {
                            "providers": [
                                {
                                    "id": "1",
                                    "descriptor": {
                                        "name": "tibil"
                                    },
                                    "locations": [
                                        {
                                            "id": "23",
                                            "city": {
                                                "code": "std:04344",
                                                "name": "Hosur"
                                            },
                                            "state": {
                                                "code": "TN",
                                                "name": "Tamil Nadu"
                                            }
                                        },
                                        {
                                            "id": "3",
                                            "city": {
                                                "code": "std:0512",
                                                "name": "Kanpur"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "4",
                                            "city": {
                                                "code": "std:0522",
                                                "name": "Lucknow"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "5",
                                            "city": {
                                                "code": "std:0542",
                                                "name": "Varanasi"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "6",
                                            "city": {
                                                "code": "std:011",
                                                "name": "Delhi"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "7",
                                            "city": {
                                                "code": "std:022",
                                                "name": "Mumbai"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "8",
                                            "city": {
                                                "code": "std:020",
                                                "name": "Pune"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "9",
                                            "city": {
                                                "code": "std:040",
                                                "name": "Hyderabad"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "10",
                                            "city": {
                                                "code": "std:08922",
                                                "name": "Vizayanagaram"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "11",
                                            "city": {
                                                "code": "std:044",
                                                "name": "Chennai"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "12",
                                            "city": {
                                                "code": "std:080",
                                                "name": "Bengaluru"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "13",
                                            "city": {
                                                "name": "Mysore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "14",
                                            "city": {
                                                "code": "std:0836",
                                                "name": "Hubli"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "15",
                                            "city": {
                                                "name": "Tumkur",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "16",
                                            "city": {
                                                "name": "Jharkh",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "17",
                                            "city": {
                                                "name": "Bihar",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "18",
                                            "city": {
                                                "name": "Orissa",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "19",
                                            "city": {
                                                "code": "std:0141",
                                                "name": "Jaipur"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "20",
                                            "city": {
                                                "name": "Gujarat",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "21",
                                            "city": {
                                                "code": "std:0755",
                                                "name": "Bhopal"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "22",
                                            "city": {
                                                "name": "4 Sahayaks per geography)",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "1",
                                            "city": {
                                                "code": "std:08152",
                                                "name": "Kolar"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "2",
                                            "city": {
                                                "name": "Karnataka",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "23",
                                            "city": {
                                                "code": "std:04344",
                                                "name": "Hosur"
                                            },
                                            "state": {
                                                "code": "TN",
                                                "name": "Tamil Nadu"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "25",
                                            "city": {
                                                "name": "Koramangala",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "26",
                                            "city": {
                                                "code": "std:0120",
                                                "name": "Greater Noida"
                                            },
                                            "state": {
                                                "code": "UP",
                                                "name": "Uttar Pradesh"
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
                                            "id": "3",
                                            "descriptor": {
                                                "name": "Blue collar workers female",
                                                "long_desc": "Technician"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Tata Electronics"
                                                }
                                            },
                                            "location_ids": [
                                                "23"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Under Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "40"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "2",
                                            "descriptor": {
                                                "name": "Sahayak's",
                                                "long_desc": "Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India."
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Jeevitam Sahayaks"
                                                }
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
                                                "12",
                                                "13",
                                                "14",
                                                "15",
                                                "16",
                                                "17",
                                                "18",
                                                "19",
                                                "20",
                                                "21",
                                                "22"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "8th Pass"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "55"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "1",
                                            "descriptor": {
                                                "name": "Assembly Line Operator",
                                                "long_desc": "Assemble the Mobile Phone Quality Inspection Quality Management"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Wistron"
                                                }
                                            },
                                            "location_ids": [
                                                "1",
                                                "2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Diploma"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "ITI"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Female"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "26"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "4",
                                            "descriptor": {
                                                "name": "Blue collar workers female",
                                                "long_desc": "OLA Electric bike Manufacturing"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "OLA"
                                                }
                                            },
                                            "location_ids": [
                                                "23"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "12th pass +"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "16000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "18000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "40"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "6",
                                            "descriptor": {
                                                "name": "Telecaller",
                                                "long_desc": "1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred "
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Fore Blend Infiscripts Pvt Ltd"
                                                }
                                            },
                                            "location_ids": [
                                                "25",
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "15000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "20000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "25"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "20"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "5",
                                            "descriptor": {
                                                "name": "Customer Support/Credit Card Sales/BPO",
                                                "long_desc": "Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Vindhya E-Infomedia Pvt Ltd"
                                                }
                                            },
                                            "location_ids": [
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "2"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "10th Pass"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "13000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "18000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "35"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": "Good communication skills in english and hindi"
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "7",
                                            "descriptor": {
                                                "name": "BDE/CIC",
                                                "long_desc": "Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Just Dial"
                                                }
                                            },
                                            "location_ids": [
                                                "26"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "2"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "18000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "30000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "35"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": "communication skills in  hindi"
                                                        }
                                                    ],
                                                    "display": true
                                                }
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
                        "bpp_id": "dev-onest.tibilprojects.com",
                        "bpp_uri": "https://dev-onest.tibilprojects.com/protocol-network",
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
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:56.442Z"
                    },
                    "message": {
                        "catalog": {
                            "providers": [
                                {
                                    "id": "1",
                                    "descriptor": {
                                        "name": "tibil"
                                    },
                                    "locations": [
                                        {
                                            "id": "23",
                                            "city": {
                                                "code": "std:04344",
                                                "name": "Hosur"
                                            },
                                            "state": {
                                                "code": "TN",
                                                "name": "Tamil Nadu"
                                            }
                                        },
                                        {
                                            "id": "3",
                                            "city": {
                                                "code": "std:0512",
                                                "name": "Kanpur"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "4",
                                            "city": {
                                                "code": "std:0522",
                                                "name": "Lucknow"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "5",
                                            "city": {
                                                "code": "std:0542",
                                                "name": "Varanasi"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "6",
                                            "city": {
                                                "code": "std:011",
                                                "name": "Delhi"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "7",
                                            "city": {
                                                "code": "std:022",
                                                "name": "Mumbai"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "8",
                                            "city": {
                                                "code": "std:020",
                                                "name": "Pune"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "9",
                                            "city": {
                                                "code": "std:040",
                                                "name": "Hyderabad"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "10",
                                            "city": {
                                                "code": "std:08922",
                                                "name": "Vizayanagaram"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "11",
                                            "city": {
                                                "code": "std:044",
                                                "name": "Chennai"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "12",
                                            "city": {
                                                "code": "std:080",
                                                "name": "Bengaluru"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "13",
                                            "city": {
                                                "name": "Mysore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "14",
                                            "city": {
                                                "code": "std:0836",
                                                "name": "Hubli"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "15",
                                            "city": {
                                                "name": "Tumkur",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "16",
                                            "city": {
                                                "name": "Jharkh",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "17",
                                            "city": {
                                                "name": "Bihar",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "18",
                                            "city": {
                                                "name": "Orissa",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "19",
                                            "city": {
                                                "code": "std:0141",
                                                "name": "Jaipur"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "20",
                                            "city": {
                                                "name": "Gujarat",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "21",
                                            "city": {
                                                "code": "std:0755",
                                                "name": "Bhopal"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "22",
                                            "city": {
                                                "name": "4 Sahayaks per geography)",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "1",
                                            "city": {
                                                "code": "std:08152",
                                                "name": "Kolar"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "2",
                                            "city": {
                                                "name": "Karnataka",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "23",
                                            "city": {
                                                "code": "std:04344",
                                                "name": "Hosur"
                                            },
                                            "state": {
                                                "code": "TN",
                                                "name": "Tamil Nadu"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "25",
                                            "city": {
                                                "name": "Koramangala",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "26",
                                            "city": {
                                                "code": "std:0120",
                                                "name": "Greater Noida"
                                            },
                                            "state": {
                                                "code": "UP",
                                                "name": "Uttar Pradesh"
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
                                            "id": "3",
                                            "descriptor": {
                                                "name": "Blue collar workers female",
                                                "long_desc": "Technician"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Tata Electronics"
                                                }
                                            },
                                            "location_ids": [
                                                "23"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Under Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "40"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "2",
                                            "descriptor": {
                                                "name": "Sahayak's",
                                                "long_desc": "Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India."
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Jeevitam Sahayaks"
                                                }
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
                                                "12",
                                                "13",
                                                "14",
                                                "15",
                                                "16",
                                                "17",
                                                "18",
                                                "19",
                                                "20",
                                                "21",
                                                "22"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "8th Pass"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "55"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "1",
                                            "descriptor": {
                                                "name": "Assembly Line Operator",
                                                "long_desc": "Assemble the Mobile Phone Quality Inspection Quality Management"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Wistron"
                                                }
                                            },
                                            "location_ids": [
                                                "1",
                                                "2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Diploma"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "ITI"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Female"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "26"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "4",
                                            "descriptor": {
                                                "name": "Blue collar workers female",
                                                "long_desc": "OLA Electric bike Manufacturing"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "OLA"
                                                }
                                            },
                                            "location_ids": [
                                                "23"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "12th pass +"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "16000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "18000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "40"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "6",
                                            "descriptor": {
                                                "name": "Telecaller",
                                                "long_desc": "1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred "
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Fore Blend Infiscripts Pvt Ltd"
                                                }
                                            },
                                            "location_ids": [
                                                "25",
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "15000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "20000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "25"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "20"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "5",
                                            "descriptor": {
                                                "name": "Customer Support/Credit Card Sales/BPO",
                                                "long_desc": "Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Vindhya E-Infomedia Pvt Ltd"
                                                }
                                            },
                                            "location_ids": [
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "2"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "10th Pass"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "13000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "18000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "35"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": "Good communication skills in english and hindi"
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "7",
                                            "descriptor": {
                                                "name": "BDE/CIC",
                                                "long_desc": "Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Just Dial"
                                                }
                                            },
                                            "location_ids": [
                                                "26"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "2"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "18000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "30000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "35"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": "communication skills in  hindi"
                                                        }
                                                    ],
                                                    "display": true
                                                }
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
                        "bpp_id": "dev-onest.tibilprojects.com",
                        "bpp_uri": "https://dev-onest.tibilprojects.com/protocol-network",
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
                        "bap_id": "jobs-bap-dev.tekdinext.com",
                        "bap_uri": "https://jobs-bap-dev.tekdinext.com/",
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60081",
                        "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60072",
                        "ttl": "PT10M",
                        "timestamp": "2024-02-15T03:36:52.398Z"
                    },
                    "message": {
                        "catalog": {
                            "providers": [
                                {
                                    "id": "1",
                                    "descriptor": {
                                        "name": "tibil"
                                    },
                                    "locations": [
                                        {
                                            "id": "23",
                                            "city": {
                                                "code": "std:04344",
                                                "name": "Hosur"
                                            },
                                            "state": {
                                                "code": "TN",
                                                "name": "Tamil Nadu"
                                            }
                                        },
                                        {
                                            "id": "3",
                                            "city": {
                                                "code": "std:0512",
                                                "name": "Kanpur"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "4",
                                            "city": {
                                                "code": "std:0522",
                                                "name": "Lucknow"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "5",
                                            "city": {
                                                "code": "std:0542",
                                                "name": "Varanasi"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "6",
                                            "city": {
                                                "code": "std:011",
                                                "name": "Delhi"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "7",
                                            "city": {
                                                "code": "std:022",
                                                "name": "Mumbai"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "8",
                                            "city": {
                                                "code": "std:020",
                                                "name": "Pune"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "9",
                                            "city": {
                                                "code": "std:040",
                                                "name": "Hyderabad"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "10",
                                            "city": {
                                                "code": "std:08922",
                                                "name": "Vizayanagaram"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "11",
                                            "city": {
                                                "code": "std:044",
                                                "name": "Chennai"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "12",
                                            "city": {
                                                "code": "std:080",
                                                "name": "Bengaluru"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "13",
                                            "city": {
                                                "name": "Mysore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "14",
                                            "city": {
                                                "code": "std:0836",
                                                "name": "Hubli"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "15",
                                            "city": {
                                                "name": "Tumkur",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "16",
                                            "city": {
                                                "name": "Jharkh",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "17",
                                            "city": {
                                                "name": "Bihar",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "18",
                                            "city": {
                                                "name": "Orissa",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "19",
                                            "city": {
                                                "code": "std:0141",
                                                "name": "Jaipur"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "20",
                                            "city": {
                                                "name": "Gujarat",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "21",
                                            "city": {
                                                "code": "std:0755",
                                                "name": "Bhopal"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "22",
                                            "city": {
                                                "name": "4 Sahayaks per geography)",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "IND",
                                                "name": "Pan India"
                                            }
                                        },
                                        {
                                            "id": "1",
                                            "city": {
                                                "code": "std:08152",
                                                "name": "Kolar"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "2",
                                            "city": {
                                                "name": "Karnataka",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "23",
                                            "city": {
                                                "code": "std:04344",
                                                "name": "Hosur"
                                            },
                                            "state": {
                                                "code": "TN",
                                                "name": "Tamil Nadu"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "25",
                                            "city": {
                                                "name": "Koramangala",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "24",
                                            "city": {
                                                "name": "Bangalore",
                                                "code": "std:000"
                                            },
                                            "state": {
                                                "code": "KA",
                                                "name": "Karnataka"
                                            }
                                        },
                                        {
                                            "id": "26",
                                            "city": {
                                                "code": "std:0120",
                                                "name": "Greater Noida"
                                            },
                                            "state": {
                                                "code": "UP",
                                                "name": "Uttar Pradesh"
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
                                            "id": "3",
                                            "descriptor": {
                                                "name": "Blue collar workers female",
                                                "long_desc": "Technician"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Tata Electronics"
                                                }
                                            },
                                            "location_ids": [
                                                "23"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Under Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "40"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "2",
                                            "descriptor": {
                                                "name": "Sahayak's",
                                                "long_desc": "Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India."
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Jeevitam Sahayaks"
                                                }
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
                                                "12",
                                                "13",
                                                "14",
                                                "15",
                                                "16",
                                                "17",
                                                "18",
                                                "19",
                                                "20",
                                                "21",
                                                "22"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "8th Pass"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "55"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "1",
                                            "descriptor": {
                                                "name": "Assembly Line Operator",
                                                "long_desc": "Assemble the Mobile Phone Quality Inspection Quality Management"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Wistron"
                                                }
                                            },
                                            "location_ids": [
                                                "1",
                                                "2"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Diploma"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "ITI"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Female"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "26"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "4",
                                            "descriptor": {
                                                "name": "Blue collar workers female",
                                                "long_desc": "OLA Electric bike Manufacturing"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "OLA"
                                                }
                                            },
                                            "location_ids": [
                                                "23"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "0"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "12th pass +"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "16000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "18000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "40"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "6",
                                            "descriptor": {
                                                "name": "Telecaller",
                                                "long_desc": "1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred "
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Fore Blend Infiscripts Pvt Ltd"
                                                }
                                            },
                                            "location_ids": [
                                                "25",
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "5"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "15000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "20000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "25"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "20"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": ""
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "5",
                                            "descriptor": {
                                                "name": "Customer Support/Credit Card Sales/BPO",
                                                "long_desc": "Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Vindhya E-Infomedia Pvt Ltd"
                                                }
                                            },
                                            "location_ids": [
                                                "24"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "2"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "10th Pass"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "13000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "18000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "35"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": "Good communication skills in english and hindi"
                                                        }
                                                    ],
                                                    "display": true
                                                }
                                            ]
                                        },
                                        {
                                            "id": "7",
                                            "descriptor": {
                                                "name": "BDE/CIC",
                                                "long_desc": "Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers"
                                            },
                                            "creator": {
                                                "descriptor": {
                                                    "name": "Just Dial"
                                                }
                                            },
                                            "location_ids": [
                                                "26"
                                            ],
                                            "fulfillment_ids": [
                                                "1"
                                            ],
                                            "tags": [
                                                {
                                                    "descriptor": {
                                                        "name": "Work Experience"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Experience"
                                                            },
                                                            "value": "0"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Experience"
                                                            },
                                                            "value": "2"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Educational Qualifications"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Qualification"
                                                            },
                                                            "value": "Graduate"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Qualification"
                                                            },
                                                            "value": "Post Graduate"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Salary Compensation",
                                                        "code": "salary-info"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Salary"
                                                            },
                                                            "value": "18000"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Salary"
                                                            },
                                                            "value": "30000"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Gender",
                                                        "code": "gender"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Gender"
                                                            },
                                                            "value": "Both"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "Age",
                                                        "code": "age"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "Min Age"
                                                            },
                                                            "value": "18"
                                                        },
                                                        {
                                                            "descriptor": {
                                                                "name": "Max Age"
                                                            },
                                                            "value": "35"
                                                        }
                                                    ],
                                                    "display": true
                                                },
                                                {
                                                    "descriptor": {
                                                        "name": "skill requirement",
                                                        "code": "Skills"
                                                    },
                                                    "list": [
                                                        {
                                                            "descriptor": {
                                                                "name": "skill"
                                                            },
                                                            "value": "communication skills in  hindi"
                                                        }
                                                    ],
                                                    "display": true
                                                }
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
