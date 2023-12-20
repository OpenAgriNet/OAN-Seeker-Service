import { Injectable } from '@nestjs/common';
import { HasuraService } from 'src/services/hasura/hasura.service';

@Injectable()
export class JobsService {

    constructor(private readonly hasuraService: HasuraService) { }

    async getJobs(getContentdto) {
        return this.hasuraService.findJobsCache(getContentdto);
    }

    async jobsApiCall() {
        console.log("jobs api calling")
        const axios = require('axios');
        let data = JSON.stringify({
            "context": {
                "domain": "onest:work-opportunities",
                "action": "search",
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
                },
                "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60008",
                "message_id": "a9aaecca-10b7-4d19-b640-b047a7c60009",
                "timestamp": "2023-02-06T09:55:41.161Z"
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
        });

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
            let response = await axios.request(config)
            console.log(JSON.stringify(response.data));

            if (response.data) {
                let arrayOfObjects = []
                for (const responses of response.data.responses) {
                    
                    for (const providers of responses.message.catalog.providers) {
                        
                        for (const [index, item] of providers.items.entries()) {
                            
                            let obj = {
                                content_id: item.id,
                                title: item.descriptor.name,
                                description: item.descriptor.long_desc,
                                location_id: item.location_ids[0],
                                //city: providers.locations.find(item => item.id === items.location_ids[0]) ? providers.locations.find(item => item.id === items.location_ids[0]).city.name : null,
                                city: providers.locations[index].city.name,
                                state: providers.locations[index].state.name,
                                country: providers.locations[index].country.name
                            }
                            arrayOfObjects.push(obj)
                        }
                    }
                }
                console.log("arrayOfObjects", arrayOfObjects)
                return this.hasuraService.insertCacheData(arrayOfObjects)
            }


        } catch (error) {
            console.log("error", error)
        }



    }

    async testApiCall() {
        const data = {
            "context": {
                "ttl": "PT10M",
                "action": "search",
                "timestamp": "2023-12-20T10:50:45.464Z",
                "message_id": "4fe53c80-e67a-4d10-8208-420c7ee66a78",
                "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60008",
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
                        "transaction_id": "a9aaecca-10b7-4d19-b640-b047a7c60008",
                        "message_id": "4fe53c80-e67a-4d10-8208-420c7ee66a78",
                        "ttl": "PT10M",
                        "timestamp": "2023-12-20T10:50:51.902Z"
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
                                                "name": "Pune"
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
                                                "name": "Delhi"
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
                }
            ]
        }

        let arrayOfObjects = []
        for (const responses of data.responses) {
            console.log("===1128===")
            for (const providers of responses.message.catalog.providers) {
                console.log("===1130===", providers.locations)
                for (const [index, item] of providers.items.entries()) {
                    console.log("===1132===")
                    let obj = {
                        content_id: item.id,
                        title: item.descriptor.name,
                        description: item.descriptor.long_desc,
                        location_id: item.location_ids[0],
                        //city: providers.locations.find(item => item.id === items.location_ids[0]) ? providers.locations.find(item => item.id === items.location_ids[0]).city.name : null,
                        city: providers.locations[index].city.name,
                        state: providers.locations[index].state.name,
                        country: providers.locations[index].country.name
                    }
                    arrayOfObjects.push(obj)
                }
            }
        }
        console.log("arrayOfObjects", arrayOfObjects)
        return this.hasuraService.insertCacheData(arrayOfObjects)
    }
}
