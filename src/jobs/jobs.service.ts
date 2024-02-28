import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseCache } from 'src/entity/response.entity';
import { LoggerService } from 'src/logger/logger.service';
import { HasuraService } from 'src/services/hasura/hasura.service';
import { ProxyService } from 'src/services/proxy/proxy.service';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
const crypto = require('crypto');

@Injectable()
export class JobsService {
    private domain = process.env.DOMAIN;
    private bap_id = process.env.BAP_ID;
    private bap_uri = process.env.BAP_URI;

    constructor(
        private readonly hasuraService: HasuraService,
        private readonly proxyService: ProxyService,
        private readonly logger: LoggerService,
        @InjectRepository(ResponseCache)
        private readonly responseCacheRepository: Repository<ResponseCache>,
    ) { }

    async getJobs(getContentdto) {
        return this.hasuraService.findJobsCache(getContentdto);
    }

    async jobsApiCall() {
        this.logger.log('create jobs api calling');
        let data = {
            context: {
                domain: this.domain,
                action: 'search',
                version: '1.1.0',
                bap_id: this.bap_id,
                bap_uri: this.bap_uri,
                transaction_id: uuidv4(),
                message_id: uuidv4(),
                timestamp: new Date().toISOString(),
            },
            message: {
                intent: {
                    item: {
                        descriptor: {
                            name: '',
                        },
                    },
                },
            },
        };

        try {
            let response = await this.proxyService.bapCLientApi2('search', data);
            console.log('res', JSON.stringify(response));
            if (response) {
                let arrayOfObjects = [];
                for (const responses of response.responses) {
                    console.log('===1128===');
                    if (
                        responses.context.bpp_id !== 'beckn-sandbox-bpp.becknprotocol.io'
                    ) {
                        for (const providers of responses.message.catalog.providers) {
                            console.log('===1130===', providers.locations);
                            for (const [index, item] of providers.items.entries()) {
                                console.log('===1132===');
                                let obj = {
                                    unique_id: this.generateFixedId(
                                        item.id,
                                        item.descriptor.name,
                                        responses.context.bpp_id,
                                    ),
                                    item_id: item.id,
                                    title: item?.descriptor?.name ? item.descriptor.name : '',
                                    description: item?.descriptor?.long_desc
                                        ? item.descriptor.long_desc
                                        : '',
                                    location_id: item?.location_ids[0]
                                        ? item.location_ids[0]
                                        : '',
                                    //city: providers.locations.find(item => item.id === items.location_ids[0]) ? providers.locations.find(item => item.id === items.location_ids[0]).city.name : null,
                                    city: providers?.locations[index]?.city.name
                                        ? providers.locations[index].city.name
                                        : '',
                                    state: providers?.locations[index]?.state.name
                                        ? providers.locations[index].state.name
                                        : '',
                                    //country: providers.locations[index].country.name ? providers.locations[index].country.name: '',
                                    provider_id: providers.id,
                                    provider_name: providers.descriptor.name,
                                    bpp_id: responses.context.bpp_id,
                                    bpp_uri: responses.context.bpp_uri,
                                    company: item?.creator?.descriptor?.name
                                        ? item.creator.descriptor.name
                                        : '',
                                    skills: item?.tags?.find(
                                        (tag) => tag.descriptor.name === 'skill requirement',
                                    )?.list[0]?.value
                                        ? item.tags.find(
                                            (tag) => tag.descriptor.name === 'skill requirement',
                                        )?.list[0].value
                                        : null,
                                    gender:
                                        item?.tags?.find(
                                            (tag) => tag.descriptor.name === 'Gender',
                                        ) &&
                                            ['Male', 'Female'].includes(
                                                item?.tags?.find(
                                                    (tag) => tag.descriptor.name === 'Gender',
                                                ).list[0]?.value,
                                            )
                                            ? item.tags.find(
                                                (tag) => tag.descriptor.name === 'Gender',
                                            ).list[0].value
                                            : null,
                                    fulfillments: providers?.fulfillments[index]?.type
                                        ? providers.fulfillments[index].type
                                        : null,
                                    item: item,
                                };
                                arrayOfObjects.push(obj);
                            }
                        }
                    }
                }
                console.log('arrayOfObjects', arrayOfObjects);
                console.log('arrayOfObjects length', arrayOfObjects.length);
                let uniqueObjects = Array.from(
                    new Set(arrayOfObjects.map((obj) => obj.unique_id)),
                ).map((id) => {
                    return arrayOfObjects.find((obj) => obj.unique_id === id);
                });
                console.log('uniqueObjects length', uniqueObjects.length);
                //return uniqueObjects
                return this.hasuraService.insertCacheData(uniqueObjects);
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    async searchResponse(body) {
        return this.hasuraService.searchResponse(body);
    }

    async select(body) {
        console.log('fetchDataFromCache');
        console.log("item_id", body.message.order.items[0].id)
        console.log("provider_id", body.message.order.provider.id)
        const query = `
    SELECT response
        FROM response_cache_dev
        CROSS JOIN LATERAL json_array_elements(response->'message'->'order'->'items') AS items
        WHERE items->>'id' = '${body.message.order.items[0].id}' 
        AND response->'message'->'order'->'provider'->>'id'='${body.message.order.provider.id}'
        AND response->'context'->>'action'='on_select'
        ORDER BY (response->>'createdAt')::timestamp DESC;
    `;
        const result = await this.responseCacheRepository.query(query);
        return result[0];
    }

    generateFixedId(...strings) {
        const combinedString = strings.join('-'); // Combine strings using a separator
        const hash = crypto
            .createHash('sha256')
            .update(combinedString)
            .digest('hex');
        return hash;
    }

    async testApiCall() {
        const response = {
            context: {
                ttl: 'PT10M',
                action: 'search',
                timestamp: '2024-02-16T04:35:00.026Z',
                message_id: 'a9aaecca-10b7-4d19-b640-b047a7c60034',
                transaction_id: 'a9aaecca-10b7-4d19-b640-b047a7c60023',
                domain: 'onest:work-opportunities',
                version: '1.1.0',
                bap_id: 'jobs-bap-dev.tekdinext.com',
                bap_uri: 'https://jobs-bap-dev.tekdinext.com/',
                location: {
                    country: {
                        name: 'India',
                        code: 'IND',
                    },
                    city: {
                        name: 'Bangalore',
                        code: 'std:080',
                    },
                },
            },
            responses: [
                {
                    context: {
                        domain: 'onest:work-opportunities',
                        action: 'on_search',
                        version: '1.1.0',
                        bpp_id: 'dev-onest.tibilprojects.com',
                        bpp_uri: 'https://dev-onest.tibilprojects.com/protocol-network',
                        country: 'IND',
                        city: 'std:080',
                        location: {
                            country: {
                                name: 'India',
                                code: 'IND',
                            },
                            city: {
                                name: 'Bangalore',
                                code: 'std:080',
                            },
                        },
                        bap_id: 'jobs-bap-dev.tekdinext.com',
                        bap_uri: 'https://jobs-bap-dev.tekdinext.com/',
                        transaction_id: 'a9aaecca-10b7-4d19-b640-b047a7c60023',
                        message_id: 'a9aaecca-10b7-4d19-b640-b047a7c60034',
                        ttl: 'PT10M',
                        timestamp: '2024-02-16T04:35:16.925Z',
                    },
                    message: {
                        catalog: {
                            providers: [
                                {
                                    id: '1',
                                    descriptor: {
                                        name: 'tibil',
                                    },
                                    locations: [
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '3',
                                            city: {
                                                code: 'std:0512',
                                                name: 'Kanpur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '4',
                                            city: {
                                                code: 'std:0522',
                                                name: 'Lucknow',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '5',
                                            city: {
                                                code: 'std:0542',
                                                name: 'Varanasi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '6',
                                            city: {
                                                code: 'std:011',
                                                name: 'Delhi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '7',
                                            city: {
                                                code: 'std:022',
                                                name: 'Mumbai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '8',
                                            city: {
                                                code: 'std:020',
                                                name: 'Pune',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '9',
                                            city: {
                                                code: 'std:040',
                                                name: 'Hyderabad',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '10',
                                            city: {
                                                code: 'std:08922',
                                                name: 'Vizayanagaram',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '11',
                                            city: {
                                                code: 'std:044',
                                                name: 'Chennai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '12',
                                            city: {
                                                code: 'std:080',
                                                name: 'Bengaluru',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '13',
                                            city: {
                                                name: 'Mysore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '14',
                                            city: {
                                                code: 'std:0836',
                                                name: 'Hubli',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '15',
                                            city: {
                                                name: 'Tumkur',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '16',
                                            city: {
                                                name: 'Jharkh',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '17',
                                            city: {
                                                name: 'Bihar',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '18',
                                            city: {
                                                name: 'Orissa',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '19',
                                            city: {
                                                code: 'std:0141',
                                                name: 'Jaipur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '20',
                                            city: {
                                                name: 'Gujarat',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '21',
                                            city: {
                                                code: 'std:0755',
                                                name: 'Bhopal',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '22',
                                            city: {
                                                name: '4 Sahayaks per geography)',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '1',
                                            city: {
                                                code: 'std:08152',
                                                name: 'Kolar',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '2',
                                            city: {
                                                name: 'Karnataka',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '25',
                                            city: {
                                                name: 'Koramangala',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '26',
                                            city: {
                                                code: 'std:0120',
                                                name: 'Greater Noida',
                                            },
                                            state: {
                                                code: 'UP',
                                                name: 'Uttar Pradesh',
                                            },
                                        },
                                    ],
                                    fulfillments: [
                                        {
                                            id: '1',
                                            type: 'remote',
                                            tracking: false,
                                        },
                                        {
                                            id: '2',
                                            type: 'hybrid',
                                            tracking: false,
                                        },
                                        {
                                            id: '3',
                                            type: 'Onsite',
                                            tracking: false,
                                        },
                                    ],
                                    items: [
                                        {
                                            id: '7',
                                            descriptor: {
                                                name: 'BDE/CIC',
                                                long_desc:
                                                    'Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Just Dial',
                                                },
                                            },
                                            location_ids: ['26'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '30000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: 'communication skills in  hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '5',
                                            descriptor: {
                                                name: 'Customer Support/Credit Card Sales/BPO',
                                                long_desc:
                                                    'Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Vindhya E-Infomedia Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '10th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '13000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value:
                                                                'Good communication skills in english and hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '6',
                                            descriptor: {
                                                name: 'Telecaller',
                                                long_desc:
                                                    '1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred ',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Fore Blend Infiscripts Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['25', '24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '15000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '20000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '25',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '20',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '4',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'OLA Electric bike Manufacturing',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'OLA',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '12th pass +',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '16000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '1',
                                            descriptor: {
                                                name: 'Assembly Line Operator',
                                                long_desc:
                                                    'Assemble the Mobile Phone Quality Inspection Quality Management',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Wistron',
                                                },
                                            },
                                            location_ids: ['1', '2'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Diploma',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'ITI',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Female',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '26',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '2',
                                            descriptor: {
                                                name: "Sahayak's",
                                                long_desc:
                                                    'Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India.',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Jeevitam Sahayaks',
                                                },
                                            },
                                            location_ids: [
                                                '3',
                                                '4',
                                                '5',
                                                '6',
                                                '7',
                                                '8',
                                                '9',
                                                '10',
                                                '11',
                                                '12',
                                                '13',
                                                '14',
                                                '15',
                                                '16',
                                                '17',
                                                '18',
                                                '19',
                                                '20',
                                                '21',
                                                '22',
                                            ],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '8th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '55',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '3',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'Technician',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Tata Electronics',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Under Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    context: {
                        domain: 'onest:work-opportunities',
                        action: 'on_search',
                        version: '1.1.0',
                        bpp_id: 'dev-onest.tibilprojects.com',
                        bpp_uri: 'https://dev-onest.tibilprojects.com/protocol-network',
                        country: 'IND',
                        city: 'std:080',
                        location: {
                            country: {
                                name: 'India',
                                code: 'IND',
                            },
                            city: {
                                name: 'Bangalore',
                                code: 'std:080',
                            },
                        },
                        bap_id: 'jobs-bap-dev.tekdinext.com',
                        bap_uri: 'https://jobs-bap-dev.tekdinext.com/',
                        transaction_id: 'a9aaecca-10b7-4d19-b640-b047a7c60023',
                        message_id: 'a9aaecca-10b7-4d19-b640-b047a7c60034',
                        ttl: 'PT10M',
                        timestamp: '2024-02-16T04:35:08.755Z',
                    },
                    message: {
                        catalog: {
                            providers: [
                                {
                                    id: '1',
                                    descriptor: {
                                        name: 'tibil',
                                    },
                                    locations: [
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '3',
                                            city: {
                                                code: 'std:0512',
                                                name: 'Kanpur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '4',
                                            city: {
                                                code: 'std:0522',
                                                name: 'Lucknow',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '5',
                                            city: {
                                                code: 'std:0542',
                                                name: 'Varanasi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '6',
                                            city: {
                                                code: 'std:011',
                                                name: 'Delhi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '7',
                                            city: {
                                                code: 'std:022',
                                                name: 'Mumbai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '8',
                                            city: {
                                                code: 'std:020',
                                                name: 'Pune',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '9',
                                            city: {
                                                code: 'std:040',
                                                name: 'Hyderabad',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '10',
                                            city: {
                                                code: 'std:08922',
                                                name: 'Vizayanagaram',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '11',
                                            city: {
                                                code: 'std:044',
                                                name: 'Chennai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '12',
                                            city: {
                                                code: 'std:080',
                                                name: 'Bengaluru',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '13',
                                            city: {
                                                name: 'Mysore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '14',
                                            city: {
                                                code: 'std:0836',
                                                name: 'Hubli',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '15',
                                            city: {
                                                name: 'Tumkur',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '16',
                                            city: {
                                                name: 'Jharkh',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '17',
                                            city: {
                                                name: 'Bihar',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '18',
                                            city: {
                                                name: 'Orissa',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '19',
                                            city: {
                                                code: 'std:0141',
                                                name: 'Jaipur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '20',
                                            city: {
                                                name: 'Gujarat',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '21',
                                            city: {
                                                code: 'std:0755',
                                                name: 'Bhopal',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '22',
                                            city: {
                                                name: '4 Sahayaks per geography)',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '1',
                                            city: {
                                                code: 'std:08152',
                                                name: 'Kolar',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '2',
                                            city: {
                                                name: 'Karnataka',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '25',
                                            city: {
                                                name: 'Koramangala',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '26',
                                            city: {
                                                code: 'std:0120',
                                                name: 'Greater Noida',
                                            },
                                            state: {
                                                code: 'UP',
                                                name: 'Uttar Pradesh',
                                            },
                                        },
                                    ],
                                    fulfillments: [
                                        {
                                            id: '1',
                                            type: 'remote',
                                            tracking: false,
                                        },
                                        {
                                            id: '2',
                                            type: 'hybrid',
                                            tracking: false,
                                        },
                                        {
                                            id: '3',
                                            type: 'Onsite',
                                            tracking: false,
                                        },
                                    ],
                                    items: [
                                        {
                                            id: '7',
                                            descriptor: {
                                                name: 'BDE/CIC',
                                                long_desc:
                                                    'Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Just Dial',
                                                },
                                            },
                                            location_ids: ['26'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '30000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: 'communication skills in  hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '5',
                                            descriptor: {
                                                name: 'Customer Support/Credit Card Sales/BPO',
                                                long_desc:
                                                    'Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Vindhya E-Infomedia Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '10th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '13000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value:
                                                                'Good communication skills in english and hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '6',
                                            descriptor: {
                                                name: 'Telecaller',
                                                long_desc:
                                                    '1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred ',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Fore Blend Infiscripts Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['25', '24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '15000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '20000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '25',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '20',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '4',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'OLA Electric bike Manufacturing',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'OLA',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '12th pass +',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '16000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '1',
                                            descriptor: {
                                                name: 'Assembly Line Operator',
                                                long_desc:
                                                    'Assemble the Mobile Phone Quality Inspection Quality Management',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Wistron',
                                                },
                                            },
                                            location_ids: ['1', '2'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Diploma',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'ITI',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Female',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '26',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '2',
                                            descriptor: {
                                                name: "Sahayak's",
                                                long_desc:
                                                    'Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India.',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Jeevitam Sahayaks',
                                                },
                                            },
                                            location_ids: [
                                                '3',
                                                '4',
                                                '5',
                                                '6',
                                                '7',
                                                '8',
                                                '9',
                                                '10',
                                                '11',
                                                '12',
                                                '13',
                                                '14',
                                                '15',
                                                '16',
                                                '17',
                                                '18',
                                                '19',
                                                '20',
                                                '21',
                                                '22',
                                            ],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '8th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '55',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '3',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'Technician',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Tata Electronics',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Under Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    context: {
                        domain: 'onest:work-opportunities',
                        action: 'on_search',
                        version: '1.1.0',
                        bpp_id: 'dev-onest.tibilprojects.com',
                        bpp_uri: 'https://dev-onest.tibilprojects.com/protocol-network',
                        country: 'IND',
                        city: 'std:080',
                        location: {
                            country: {
                                name: 'India',
                                code: 'IND',
                            },
                            city: {
                                name: 'Bangalore',
                                code: 'std:080',
                            },
                        },
                        bap_id: 'jobs-bap-dev.tekdinext.com',
                        bap_uri: 'https://jobs-bap-dev.tekdinext.com/',
                        transaction_id: 'a9aaecca-10b7-4d19-b640-b047a7c60023',
                        message_id: 'a9aaecca-10b7-4d19-b640-b047a7c60034',
                        ttl: 'PT10M',
                        timestamp: '2024-02-16T04:35:23.786Z',
                    },
                    message: {
                        catalog: {
                            providers: [
                                {
                                    id: '1',
                                    descriptor: {
                                        name: 'tibil',
                                    },
                                    locations: [
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '3',
                                            city: {
                                                code: 'std:0512',
                                                name: 'Kanpur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '4',
                                            city: {
                                                code: 'std:0522',
                                                name: 'Lucknow',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '5',
                                            city: {
                                                code: 'std:0542',
                                                name: 'Varanasi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '6',
                                            city: {
                                                code: 'std:011',
                                                name: 'Delhi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '7',
                                            city: {
                                                code: 'std:022',
                                                name: 'Mumbai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '8',
                                            city: {
                                                code: 'std:020',
                                                name: 'Pune',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '9',
                                            city: {
                                                code: 'std:040',
                                                name: 'Hyderabad',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '10',
                                            city: {
                                                code: 'std:08922',
                                                name: 'Vizayanagaram',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '11',
                                            city: {
                                                code: 'std:044',
                                                name: 'Chennai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '12',
                                            city: {
                                                code: 'std:080',
                                                name: 'Bengaluru',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '13',
                                            city: {
                                                name: 'Mysore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '14',
                                            city: {
                                                code: 'std:0836',
                                                name: 'Hubli',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '15',
                                            city: {
                                                name: 'Tumkur',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '16',
                                            city: {
                                                name: 'Jharkh',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '17',
                                            city: {
                                                name: 'Bihar',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '18',
                                            city: {
                                                name: 'Orissa',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '19',
                                            city: {
                                                code: 'std:0141',
                                                name: 'Jaipur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '20',
                                            city: {
                                                name: 'Gujarat',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '21',
                                            city: {
                                                code: 'std:0755',
                                                name: 'Bhopal',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '22',
                                            city: {
                                                name: '4 Sahayaks per geography)',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '1',
                                            city: {
                                                code: 'std:08152',
                                                name: 'Kolar',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '2',
                                            city: {
                                                name: 'Karnataka',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '25',
                                            city: {
                                                name: 'Koramangala',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '26',
                                            city: {
                                                code: 'std:0120',
                                                name: 'Greater Noida',
                                            },
                                            state: {
                                                code: 'UP',
                                                name: 'Uttar Pradesh',
                                            },
                                        },
                                    ],
                                    fulfillments: [
                                        {
                                            id: '1',
                                            type: 'remote',
                                            tracking: false,
                                        },
                                        {
                                            id: '2',
                                            type: 'hybrid',
                                            tracking: false,
                                        },
                                        {
                                            id: '3',
                                            type: 'Onsite',
                                            tracking: false,
                                        },
                                    ],
                                    items: [
                                        {
                                            id: '7',
                                            descriptor: {
                                                name: 'BDE/CIC',
                                                long_desc:
                                                    'Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Just Dial',
                                                },
                                            },
                                            location_ids: ['26'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '30000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: 'communication skills in  hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '5',
                                            descriptor: {
                                                name: 'Customer Support/Credit Card Sales/BPO',
                                                long_desc:
                                                    'Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Vindhya E-Infomedia Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '10th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '13000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value:
                                                                'Good communication skills in english and hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '6',
                                            descriptor: {
                                                name: 'Telecaller',
                                                long_desc:
                                                    '1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred ',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Fore Blend Infiscripts Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['25', '24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '15000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '20000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '25',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '20',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '4',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'OLA Electric bike Manufacturing',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'OLA',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '12th pass +',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '16000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '1',
                                            descriptor: {
                                                name: 'Assembly Line Operator',
                                                long_desc:
                                                    'Assemble the Mobile Phone Quality Inspection Quality Management',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Wistron',
                                                },
                                            },
                                            location_ids: ['1', '2'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Diploma',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'ITI',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Female',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '26',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '2',
                                            descriptor: {
                                                name: "Sahayak's",
                                                long_desc:
                                                    'Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India.',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Jeevitam Sahayaks',
                                                },
                                            },
                                            location_ids: [
                                                '3',
                                                '4',
                                                '5',
                                                '6',
                                                '7',
                                                '8',
                                                '9',
                                                '10',
                                                '11',
                                                '12',
                                                '13',
                                                '14',
                                                '15',
                                                '16',
                                                '17',
                                                '18',
                                                '19',
                                                '20',
                                                '21',
                                                '22',
                                            ],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '8th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '55',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '3',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'Technician',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Tata Electronics',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Under Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    context: {
                        domain: 'onest:work-opportunities',
                        action: 'on_search',
                        version: '1.1.0',
                        bpp_id: 'dev-onest.tibilprojects.com',
                        bpp_uri: 'https://dev-onest.tibilprojects.com/protocol-network',
                        country: 'IND',
                        city: 'std:080',
                        location: {
                            country: {
                                name: 'India',
                                code: 'IND',
                            },
                            city: {
                                name: 'Bangalore',
                                code: 'std:080',
                            },
                        },
                        bap_id: 'jobs-bap-dev.tekdinext.com',
                        bap_uri: 'https://jobs-bap-dev.tekdinext.com/',
                        transaction_id: 'a9aaecca-10b7-4d19-b640-b047a7c60023',
                        message_id: 'a9aaecca-10b7-4d19-b640-b047a7c60034',
                        ttl: 'PT10M',
                        timestamp: '2024-02-16T04:35:08.755Z',
                    },
                    message: {
                        catalog: {
                            providers: [
                                {
                                    id: '1',
                                    descriptor: {
                                        name: 'tibil',
                                    },
                                    locations: [
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '3',
                                            city: {
                                                code: 'std:0512',
                                                name: 'Kanpur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '4',
                                            city: {
                                                code: 'std:0522',
                                                name: 'Lucknow',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '5',
                                            city: {
                                                code: 'std:0542',
                                                name: 'Varanasi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '6',
                                            city: {
                                                code: 'std:011',
                                                name: 'Delhi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '7',
                                            city: {
                                                code: 'std:022',
                                                name: 'Mumbai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '8',
                                            city: {
                                                code: 'std:020',
                                                name: 'Pune',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '9',
                                            city: {
                                                code: 'std:040',
                                                name: 'Hyderabad',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '10',
                                            city: {
                                                code: 'std:08922',
                                                name: 'Vizayanagaram',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '11',
                                            city: {
                                                code: 'std:044',
                                                name: 'Chennai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '12',
                                            city: {
                                                code: 'std:080',
                                                name: 'Bengaluru',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '13',
                                            city: {
                                                name: 'Mysore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '14',
                                            city: {
                                                code: 'std:0836',
                                                name: 'Hubli',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '15',
                                            city: {
                                                name: 'Tumkur',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '16',
                                            city: {
                                                name: 'Jharkh',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '17',
                                            city: {
                                                name: 'Bihar',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '18',
                                            city: {
                                                name: 'Orissa',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '19',
                                            city: {
                                                code: 'std:0141',
                                                name: 'Jaipur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '20',
                                            city: {
                                                name: 'Gujarat',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '21',
                                            city: {
                                                code: 'std:0755',
                                                name: 'Bhopal',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '22',
                                            city: {
                                                name: '4 Sahayaks per geography)',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '1',
                                            city: {
                                                code: 'std:08152',
                                                name: 'Kolar',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '2',
                                            city: {
                                                name: 'Karnataka',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '25',
                                            city: {
                                                name: 'Koramangala',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '26',
                                            city: {
                                                code: 'std:0120',
                                                name: 'Greater Noida',
                                            },
                                            state: {
                                                code: 'UP',
                                                name: 'Uttar Pradesh',
                                            },
                                        },
                                    ],
                                    fulfillments: [
                                        {
                                            id: '1',
                                            type: 'remote',
                                            tracking: false,
                                        },
                                        {
                                            id: '2',
                                            type: 'hybrid',
                                            tracking: false,
                                        },
                                        {
                                            id: '3',
                                            type: 'Onsite',
                                            tracking: false,
                                        },
                                    ],
                                    items: [
                                        {
                                            id: '7',
                                            descriptor: {
                                                name: 'BDE/CIC',
                                                long_desc:
                                                    'Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Just Dial',
                                                },
                                            },
                                            location_ids: ['26'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '30000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: 'communication skills in  hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '5',
                                            descriptor: {
                                                name: 'Customer Support/Credit Card Sales/BPO',
                                                long_desc:
                                                    'Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Vindhya E-Infomedia Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '10th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '13000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value:
                                                                'Good communication skills in english and hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '6',
                                            descriptor: {
                                                name: 'Telecaller',
                                                long_desc:
                                                    '1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred ',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Fore Blend Infiscripts Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['25', '24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '15000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '20000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '25',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '20',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '4',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'OLA Electric bike Manufacturing',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'OLA',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '12th pass +',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '16000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '1',
                                            descriptor: {
                                                name: 'Assembly Line Operator',
                                                long_desc:
                                                    'Assemble the Mobile Phone Quality Inspection Quality Management',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Wistron',
                                                },
                                            },
                                            location_ids: ['1', '2'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Diploma',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'ITI',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Female',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '26',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '2',
                                            descriptor: {
                                                name: "Sahayak's",
                                                long_desc:
                                                    'Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India.',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Jeevitam Sahayaks',
                                                },
                                            },
                                            location_ids: [
                                                '3',
                                                '4',
                                                '5',
                                                '6',
                                                '7',
                                                '8',
                                                '9',
                                                '10',
                                                '11',
                                                '12',
                                                '13',
                                                '14',
                                                '15',
                                                '16',
                                                '17',
                                                '18',
                                                '19',
                                                '20',
                                                '21',
                                                '22',
                                            ],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '8th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '55',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '3',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'Technician',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Tata Electronics',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Under Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    context: {
                        domain: 'onest:work-opportunities',
                        action: 'on_search',
                        version: '1.1.0',
                        bpp_id: 'dev-onest.tibilprojects.com',
                        bpp_uri: 'https://dev-onest.tibilprojects.com/protocol-network',
                        country: 'IND',
                        city: 'std:080',
                        location: {
                            country: {
                                name: 'India',
                                code: 'IND',
                            },
                            city: {
                                name: 'Bangalore',
                                code: 'std:080',
                            },
                        },
                        bap_id: 'jobs-bap-dev.tekdinext.com',
                        bap_uri: 'https://jobs-bap-dev.tekdinext.com/',
                        transaction_id: 'a9aaecca-10b7-4d19-b640-b047a7c60023',
                        message_id: 'a9aaecca-10b7-4d19-b640-b047a7c60034',
                        ttl: 'PT10M',
                        timestamp: '2024-02-16T04:35:16.925Z',
                    },
                    message: {
                        catalog: {
                            providers: [
                                {
                                    id: '1',
                                    descriptor: {
                                        name: 'tibil',
                                    },
                                    locations: [
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '3',
                                            city: {
                                                code: 'std:0512',
                                                name: 'Kanpur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '4',
                                            city: {
                                                code: 'std:0522',
                                                name: 'Lucknow',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '5',
                                            city: {
                                                code: 'std:0542',
                                                name: 'Varanasi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '6',
                                            city: {
                                                code: 'std:011',
                                                name: 'Delhi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '7',
                                            city: {
                                                code: 'std:022',
                                                name: 'Mumbai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '8',
                                            city: {
                                                code: 'std:020',
                                                name: 'Pune',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '9',
                                            city: {
                                                code: 'std:040',
                                                name: 'Hyderabad',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '10',
                                            city: {
                                                code: 'std:08922',
                                                name: 'Vizayanagaram',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '11',
                                            city: {
                                                code: 'std:044',
                                                name: 'Chennai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '12',
                                            city: {
                                                code: 'std:080',
                                                name: 'Bengaluru',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '13',
                                            city: {
                                                name: 'Mysore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '14',
                                            city: {
                                                code: 'std:0836',
                                                name: 'Hubli',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '15',
                                            city: {
                                                name: 'Tumkur',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '16',
                                            city: {
                                                name: 'Jharkh',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '17',
                                            city: {
                                                name: 'Bihar',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '18',
                                            city: {
                                                name: 'Orissa',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '19',
                                            city: {
                                                code: 'std:0141',
                                                name: 'Jaipur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '20',
                                            city: {
                                                name: 'Gujarat',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '21',
                                            city: {
                                                code: 'std:0755',
                                                name: 'Bhopal',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '22',
                                            city: {
                                                name: '4 Sahayaks per geography)',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '1',
                                            city: {
                                                code: 'std:08152',
                                                name: 'Kolar',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '2',
                                            city: {
                                                name: 'Karnataka',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '25',
                                            city: {
                                                name: 'Koramangala',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '26',
                                            city: {
                                                code: 'std:0120',
                                                name: 'Greater Noida',
                                            },
                                            state: {
                                                code: 'UP',
                                                name: 'Uttar Pradesh',
                                            },
                                        },
                                    ],
                                    fulfillments: [
                                        {
                                            id: '1',
                                            type: 'remote',
                                            tracking: false,
                                        },
                                        {
                                            id: '2',
                                            type: 'hybrid',
                                            tracking: false,
                                        },
                                        {
                                            id: '3',
                                            type: 'Onsite',
                                            tracking: false,
                                        },
                                    ],
                                    items: [
                                        {
                                            id: '7',
                                            descriptor: {
                                                name: 'BDE/CIC',
                                                long_desc:
                                                    'Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Just Dial',
                                                },
                                            },
                                            location_ids: ['26'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '30000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: 'communication skills in  hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '5',
                                            descriptor: {
                                                name: 'Customer Support/Credit Card Sales/BPO',
                                                long_desc:
                                                    'Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Vindhya E-Infomedia Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '10th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '13000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value:
                                                                'Good communication skills in english and hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '6',
                                            descriptor: {
                                                name: 'Telecaller',
                                                long_desc:
                                                    '1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred ',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Fore Blend Infiscripts Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['25', '24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '15000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '20000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '25',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '20',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '4',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'OLA Electric bike Manufacturing',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'OLA',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '12th pass +',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '16000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '1',
                                            descriptor: {
                                                name: 'Assembly Line Operator',
                                                long_desc:
                                                    'Assemble the Mobile Phone Quality Inspection Quality Management',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Wistron',
                                                },
                                            },
                                            location_ids: ['1', '2'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Diploma',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'ITI',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Female',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '26',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '2',
                                            descriptor: {
                                                name: "Sahayak's",
                                                long_desc:
                                                    'Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India.',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Jeevitam Sahayaks',
                                                },
                                            },
                                            location_ids: [
                                                '3',
                                                '4',
                                                '5',
                                                '6',
                                                '7',
                                                '8',
                                                '9',
                                                '10',
                                                '11',
                                                '12',
                                                '13',
                                                '14',
                                                '15',
                                                '16',
                                                '17',
                                                '18',
                                                '19',
                                                '20',
                                                '21',
                                                '22',
                                            ],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '8th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '55',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '3',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'Technician',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Tata Electronics',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Under Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    context: {
                        domain: 'onest:work-opportunities',
                        action: 'on_search',
                        version: '1.1.0',
                        bpp_id: 'dev-onest.tibilprojects.com',
                        bpp_uri: 'https://dev-onest.tibilprojects.com/protocol-network',
                        country: 'IND',
                        city: 'std:080',
                        location: {
                            country: {
                                name: 'India',
                                code: 'IND',
                            },
                            city: {
                                name: 'Bangalore',
                                code: 'std:080',
                            },
                        },
                        bap_id: 'jobs-bap-dev.tekdinext.com',
                        bap_uri: 'https://jobs-bap-dev.tekdinext.com/',
                        transaction_id: 'a9aaecca-10b7-4d19-b640-b047a7c60023',
                        message_id: 'a9aaecca-10b7-4d19-b640-b047a7c60034',
                        ttl: 'PT10M',
                        timestamp: '2024-02-16T04:35:23.786Z',
                    },
                    message: {
                        catalog: {
                            providers: [
                                {
                                    id: '1',
                                    descriptor: {
                                        name: 'tibil',
                                    },
                                    locations: [
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '3',
                                            city: {
                                                code: 'std:0512',
                                                name: 'Kanpur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '4',
                                            city: {
                                                code: 'std:0522',
                                                name: 'Lucknow',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '5',
                                            city: {
                                                code: 'std:0542',
                                                name: 'Varanasi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '6',
                                            city: {
                                                code: 'std:011',
                                                name: 'Delhi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '7',
                                            city: {
                                                code: 'std:022',
                                                name: 'Mumbai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '8',
                                            city: {
                                                code: 'std:020',
                                                name: 'Pune',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '9',
                                            city: {
                                                code: 'std:040',
                                                name: 'Hyderabad',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '10',
                                            city: {
                                                code: 'std:08922',
                                                name: 'Vizayanagaram',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '11',
                                            city: {
                                                code: 'std:044',
                                                name: 'Chennai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '12',
                                            city: {
                                                code: 'std:080',
                                                name: 'Bengaluru',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '13',
                                            city: {
                                                name: 'Mysore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '14',
                                            city: {
                                                code: 'std:0836',
                                                name: 'Hubli',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '15',
                                            city: {
                                                name: 'Tumkur',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '16',
                                            city: {
                                                name: 'Jharkh',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '17',
                                            city: {
                                                name: 'Bihar',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '18',
                                            city: {
                                                name: 'Orissa',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '19',
                                            city: {
                                                code: 'std:0141',
                                                name: 'Jaipur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '20',
                                            city: {
                                                name: 'Gujarat',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '21',
                                            city: {
                                                code: 'std:0755',
                                                name: 'Bhopal',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '22',
                                            city: {
                                                name: '4 Sahayaks per geography)',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '1',
                                            city: {
                                                code: 'std:08152',
                                                name: 'Kolar',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '2',
                                            city: {
                                                name: 'Karnataka',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '25',
                                            city: {
                                                name: 'Koramangala',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '26',
                                            city: {
                                                code: 'std:0120',
                                                name: 'Greater Noida',
                                            },
                                            state: {
                                                code: 'UP',
                                                name: 'Uttar Pradesh',
                                            },
                                        },
                                    ],
                                    fulfillments: [
                                        {
                                            id: '1',
                                            type: 'remote',
                                            tracking: false,
                                        },
                                        {
                                            id: '2',
                                            type: 'hybrid',
                                            tracking: false,
                                        },
                                        {
                                            id: '3',
                                            type: 'Onsite',
                                            tracking: false,
                                        },
                                    ],
                                    items: [
                                        {
                                            id: '7',
                                            descriptor: {
                                                name: 'BDE/CIC',
                                                long_desc:
                                                    'Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Just Dial',
                                                },
                                            },
                                            location_ids: ['26'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '30000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: 'communication skills in  hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '5',
                                            descriptor: {
                                                name: 'Customer Support/Credit Card Sales/BPO',
                                                long_desc:
                                                    'Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Vindhya E-Infomedia Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '10th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '13000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value:
                                                                'Good communication skills in english and hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '6',
                                            descriptor: {
                                                name: 'Telecaller',
                                                long_desc:
                                                    '1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred ',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Fore Blend Infiscripts Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['25', '24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '15000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '20000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '25',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '20',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '4',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'OLA Electric bike Manufacturing',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'OLA',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '12th pass +',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '16000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '1',
                                            descriptor: {
                                                name: 'Assembly Line Operator',
                                                long_desc:
                                                    'Assemble the Mobile Phone Quality Inspection Quality Management',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Wistron',
                                                },
                                            },
                                            location_ids: ['1', '2'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Diploma',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'ITI',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Female',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '26',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '2',
                                            descriptor: {
                                                name: "Sahayak's",
                                                long_desc:
                                                    'Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India.',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Jeevitam Sahayaks',
                                                },
                                            },
                                            location_ids: [
                                                '3',
                                                '4',
                                                '5',
                                                '6',
                                                '7',
                                                '8',
                                                '9',
                                                '10',
                                                '11',
                                                '12',
                                                '13',
                                                '14',
                                                '15',
                                                '16',
                                                '17',
                                                '18',
                                                '19',
                                                '20',
                                                '21',
                                                '22',
                                            ],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '8th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '55',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '3',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'Technician',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Tata Electronics',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Under Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    context: {
                        domain: 'onest:work-opportunities',
                        action: 'on_search',
                        version: '1.1.0',
                        bpp_id: 'dev-onest.tibilprojects.com',
                        bpp_uri: 'https://dev-onest.tibilprojects.com/protocol-network',
                        country: 'IND',
                        city: 'std:080',
                        location: {
                            country: {
                                name: 'India',
                                code: 'IND',
                            },
                            city: {
                                name: 'Bangalore',
                                code: 'std:080',
                            },
                        },
                        bap_id: 'jobs-bap-dev.tekdinext.com',
                        bap_uri: 'https://jobs-bap-dev.tekdinext.com/',
                        transaction_id: 'a9aaecca-10b7-4d19-b640-b047a7c60023',
                        message_id: 'a9aaecca-10b7-4d19-b640-b047a7c60034',
                        ttl: 'PT10M',
                        timestamp: '2024-02-16T04:35:16.925Z',
                    },
                    message: {
                        catalog: {
                            providers: [
                                {
                                    id: '1',
                                    descriptor: {
                                        name: 'tibil',
                                    },
                                    locations: [
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '3',
                                            city: {
                                                code: 'std:0512',
                                                name: 'Kanpur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '4',
                                            city: {
                                                code: 'std:0522',
                                                name: 'Lucknow',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '5',
                                            city: {
                                                code: 'std:0542',
                                                name: 'Varanasi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '6',
                                            city: {
                                                code: 'std:011',
                                                name: 'Delhi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '7',
                                            city: {
                                                code: 'std:022',
                                                name: 'Mumbai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '8',
                                            city: {
                                                code: 'std:020',
                                                name: 'Pune',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '9',
                                            city: {
                                                code: 'std:040',
                                                name: 'Hyderabad',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '10',
                                            city: {
                                                code: 'std:08922',
                                                name: 'Vizayanagaram',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '11',
                                            city: {
                                                code: 'std:044',
                                                name: 'Chennai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '12',
                                            city: {
                                                code: 'std:080',
                                                name: 'Bengaluru',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '13',
                                            city: {
                                                name: 'Mysore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '14',
                                            city: {
                                                code: 'std:0836',
                                                name: 'Hubli',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '15',
                                            city: {
                                                name: 'Tumkur',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '16',
                                            city: {
                                                name: 'Jharkh',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '17',
                                            city: {
                                                name: 'Bihar',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '18',
                                            city: {
                                                name: 'Orissa',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '19',
                                            city: {
                                                code: 'std:0141',
                                                name: 'Jaipur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '20',
                                            city: {
                                                name: 'Gujarat',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '21',
                                            city: {
                                                code: 'std:0755',
                                                name: 'Bhopal',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '22',
                                            city: {
                                                name: '4 Sahayaks per geography)',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '1',
                                            city: {
                                                code: 'std:08152',
                                                name: 'Kolar',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '2',
                                            city: {
                                                name: 'Karnataka',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '25',
                                            city: {
                                                name: 'Koramangala',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '26',
                                            city: {
                                                code: 'std:0120',
                                                name: 'Greater Noida',
                                            },
                                            state: {
                                                code: 'UP',
                                                name: 'Uttar Pradesh',
                                            },
                                        },
                                    ],
                                    fulfillments: [
                                        {
                                            id: '1',
                                            type: 'remote',
                                            tracking: false,
                                        },
                                        {
                                            id: '2',
                                            type: 'hybrid',
                                            tracking: false,
                                        },
                                        {
                                            id: '3',
                                            type: 'Onsite',
                                            tracking: false,
                                        },
                                    ],
                                    items: [
                                        {
                                            id: '7',
                                            descriptor: {
                                                name: 'BDE/CIC',
                                                long_desc:
                                                    'Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Just Dial',
                                                },
                                            },
                                            location_ids: ['26'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '30000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: 'communication skills in  hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '5',
                                            descriptor: {
                                                name: 'Customer Support/Credit Card Sales/BPO',
                                                long_desc:
                                                    'Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Vindhya E-Infomedia Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '10th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '13000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value:
                                                                'Good communication skills in english and hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '6',
                                            descriptor: {
                                                name: 'Telecaller',
                                                long_desc:
                                                    '1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred ',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Fore Blend Infiscripts Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['25', '24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '15000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '20000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '25',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '20',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '4',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'OLA Electric bike Manufacturing',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'OLA',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '12th pass +',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '16000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '1',
                                            descriptor: {
                                                name: 'Assembly Line Operator',
                                                long_desc:
                                                    'Assemble the Mobile Phone Quality Inspection Quality Management',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Wistron',
                                                },
                                            },
                                            location_ids: ['1', '2'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Diploma',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'ITI',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Female',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '26',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '2',
                                            descriptor: {
                                                name: "Sahayak's",
                                                long_desc:
                                                    'Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India.',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Jeevitam Sahayaks',
                                                },
                                            },
                                            location_ids: [
                                                '3',
                                                '4',
                                                '5',
                                                '6',
                                                '7',
                                                '8',
                                                '9',
                                                '10',
                                                '11',
                                                '12',
                                                '13',
                                                '14',
                                                '15',
                                                '16',
                                                '17',
                                                '18',
                                                '19',
                                                '20',
                                                '21',
                                                '22',
                                            ],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '8th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '55',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '3',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'Technician',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Tata Electronics',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Under Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    context: {
                        domain: 'onest:work-opportunities',
                        action: 'on_search',
                        version: '1.1.0',
                        bpp_id: 'dev-onest.tibilprojects.com',
                        bpp_uri: 'https://dev-onest.tibilprojects.com/protocol-network',
                        country: 'IND',
                        city: 'std:080',
                        location: {
                            country: {
                                name: 'India',
                                code: 'IND',
                            },
                            city: {
                                name: 'Bangalore',
                                code: 'std:080',
                            },
                        },
                        bap_id: 'jobs-bap-dev.tekdinext.com',
                        bap_uri: 'https://jobs-bap-dev.tekdinext.com/',
                        transaction_id: 'a9aaecca-10b7-4d19-b640-b047a7c60023',
                        message_id: 'a9aaecca-10b7-4d19-b640-b047a7c60034',
                        ttl: 'PT10M',
                        timestamp: '2024-02-16T04:35:08.755Z',
                    },
                    message: {
                        catalog: {
                            providers: [
                                {
                                    id: '1',
                                    descriptor: {
                                        name: 'tibil',
                                    },
                                    locations: [
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '3',
                                            city: {
                                                code: 'std:0512',
                                                name: 'Kanpur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '4',
                                            city: {
                                                code: 'std:0522',
                                                name: 'Lucknow',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '5',
                                            city: {
                                                code: 'std:0542',
                                                name: 'Varanasi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '6',
                                            city: {
                                                code: 'std:011',
                                                name: 'Delhi',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '7',
                                            city: {
                                                code: 'std:022',
                                                name: 'Mumbai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '8',
                                            city: {
                                                code: 'std:020',
                                                name: 'Pune',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '9',
                                            city: {
                                                code: 'std:040',
                                                name: 'Hyderabad',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '10',
                                            city: {
                                                code: 'std:08922',
                                                name: 'Vizayanagaram',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '11',
                                            city: {
                                                code: 'std:044',
                                                name: 'Chennai',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '12',
                                            city: {
                                                code: 'std:080',
                                                name: 'Bengaluru',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '13',
                                            city: {
                                                name: 'Mysore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '14',
                                            city: {
                                                code: 'std:0836',
                                                name: 'Hubli',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '15',
                                            city: {
                                                name: 'Tumkur',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '16',
                                            city: {
                                                name: 'Jharkh',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '17',
                                            city: {
                                                name: 'Bihar',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '18',
                                            city: {
                                                name: 'Orissa',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '19',
                                            city: {
                                                code: 'std:0141',
                                                name: 'Jaipur',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '20',
                                            city: {
                                                name: 'Gujarat',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '21',
                                            city: {
                                                code: 'std:0755',
                                                name: 'Bhopal',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '22',
                                            city: {
                                                name: '4 Sahayaks per geography)',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'IND',
                                                name: 'Pan India',
                                            },
                                        },
                                        {
                                            id: '1',
                                            city: {
                                                code: 'std:08152',
                                                name: 'Kolar',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '2',
                                            city: {
                                                name: 'Karnataka',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '23',
                                            city: {
                                                code: 'std:04344',
                                                name: 'Hosur',
                                            },
                                            state: {
                                                code: 'TN',
                                                name: 'Tamil Nadu',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '25',
                                            city: {
                                                name: 'Koramangala',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '24',
                                            city: {
                                                name: 'Bangalore',
                                                code: 'std:000',
                                            },
                                            state: {
                                                code: 'KA',
                                                name: 'Karnataka',
                                            },
                                        },
                                        {
                                            id: '26',
                                            city: {
                                                code: 'std:0120',
                                                name: 'Greater Noida',
                                            },
                                            state: {
                                                code: 'UP',
                                                name: 'Uttar Pradesh',
                                            },
                                        },
                                    ],
                                    fulfillments: [
                                        {
                                            id: '1',
                                            type: 'remote',
                                            tracking: false,
                                        },
                                        {
                                            id: '2',
                                            type: 'hybrid',
                                            tracking: false,
                                        },
                                        {
                                            id: '3',
                                            type: 'Onsite',
                                            tracking: false,
                                        },
                                    ],
                                    items: [
                                        {
                                            id: '7',
                                            descriptor: {
                                                name: 'BDE/CIC',
                                                long_desc:
                                                    'Increase free & Paid listing in Justdial Platform, Manager sales & Post sales queries of Customers',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Just Dial',
                                                },
                                            },
                                            location_ids: ['26'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '30000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: 'communication skills in  hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '5',
                                            descriptor: {
                                                name: 'Customer Support/Credit Card Sales/BPO',
                                                long_desc:
                                                    'Inbound Call receiving & providing desired information to the caller, Documentation of customer details, Identify the needs of customers, resolve issues, and provide solutions,',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Vindhya E-Infomedia Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '2',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '10th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '13000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '35',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value:
                                                                'Good communication skills in english and hindi',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '6',
                                            descriptor: {
                                                name: 'Telecaller',
                                                long_desc:
                                                    '1. Opening of Demat Accounts and to complete his/her targets. 2. Will be responsible to map potential customers and existing clients for referrals to generate sales leads. 3. Document collections, KYC and other verifications. 4. Responsible in making outbound calls to open Demat Accounts for leads. 5.Any Graduate & Freshers also can apply. 6.Salary with good incentives, Preferring both Male and Female 7.Candidates with good fluency in Tamil,Kannada,Telugu,Malayalam,Hindi are preferred ',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Fore Blend Infiscripts Pvt Ltd',
                                                },
                                            },
                                            location_ids: ['25', '24'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '15000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '20000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '25',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '20',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '4',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'OLA Electric bike Manufacturing',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'OLA',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '12th pass +',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '16000',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '18000',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '1',
                                            descriptor: {
                                                name: 'Assembly Line Operator',
                                                long_desc:
                                                    'Assemble the Mobile Phone Quality Inspection Quality Management',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Wistron',
                                                },
                                            },
                                            location_ids: ['1', '2'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Diploma',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'ITI',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Female',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '26',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '2',
                                            descriptor: {
                                                name: "Sahayak's",
                                                long_desc:
                                                    'Jeevitam is building an ecosystem of Livelihood Partners by providing adequate freelancing opportunities. Sahayaks or Livelihood partners can be any individual looking for work opportunities as an additional source of income, flexible working hours and remote working i.e. work from home at your convenience. Sahayaks can be anywhere in India.',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Jeevitam Sahayaks',
                                                },
                                            },
                                            location_ids: [
                                                '3',
                                                '4',
                                                '5',
                                                '6',
                                                '7',
                                                '8',
                                                '9',
                                                '10',
                                                '11',
                                                '12',
                                                '13',
                                                '14',
                                                '15',
                                                '16',
                                                '17',
                                                '18',
                                                '19',
                                                '20',
                                                '21',
                                                '22',
                                            ],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '5',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: '8th Pass',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: 'Post Graduate',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: 'Both',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '55',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                        {
                                            id: '3',
                                            descriptor: {
                                                name: 'Blue collar workers female',
                                                long_desc: 'Technician',
                                            },
                                            creator: {
                                                descriptor: {
                                                    name: 'Tata Electronics',
                                                },
                                            },
                                            location_ids: ['23'],
                                            fulfillment_ids: ['1'],
                                            tags: [
                                                {
                                                    descriptor: {
                                                        name: 'Work Experience',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Experience',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Educational Qualifications',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Qualification',
                                                            },
                                                            value: 'Under Graduate',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Qualification',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Salary Compensation',
                                                        code: 'salary-info',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Salary',
                                                            },
                                                            value: '0',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Gender',
                                                        code: 'gender',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Gender',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'Age',
                                                        code: 'age',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'Min Age',
                                                            },
                                                            value: '18',
                                                        },
                                                        {
                                                            descriptor: {
                                                                name: 'Max Age',
                                                            },
                                                            value: '40',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                                {
                                                    descriptor: {
                                                        name: 'skill requirement',
                                                        code: 'Skills',
                                                    },
                                                    list: [
                                                        {
                                                            descriptor: {
                                                                name: 'skill',
                                                            },
                                                            value: '',
                                                        },
                                                    ],
                                                    display: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
        };

        let arrayOfObjects = [];
        for (const responses of response.responses) {
            console.log('===1128===');
            if (responses.context.bpp_id !== 'beckn-sandbox-bpp.becknprotocol.io') {
                for (const providers of responses.message.catalog.providers) {
                    console.log('===1130===', providers.locations);
                    for (const [index, item] of providers.items.entries()) {
                        console.log('===1132===');
                        let obj = {
                            unique_id: this.generateFixedId(
                                item.id,
                                item.descriptor.name,
                                responses.context.bpp_id,
                            ),
                            item_id: item.id,
                            title: item?.descriptor?.name ? item.descriptor.name : '',
                            description: item?.descriptor?.long_desc
                                ? item.descriptor.long_desc
                                : '',
                            location_id: item?.location_ids[0] ? item.location_ids[0] : '',
                            //city: providers.locations.find(item => item.id === items.location_ids[0]) ? providers.locations.find(item => item.id === items.location_ids[0]).city.name : null,
                            city: providers?.locations[index]?.city.name
                                ? providers.locations[index].city.name
                                : '',
                            state: providers?.locations[index]?.state.name
                                ? providers.locations[index].state.name
                                : '',
                            //country: providers.locations[index].country.name ? providers.locations[index].country.name: '',
                            provider_id: providers.id,
                            provider_name: providers.descriptor.name,
                            bpp_id: responses.context.bpp_id,
                            bpp_uri: responses.context.bpp_uri,
                            company: item?.creator?.descriptor?.name
                                ? item.creator.descriptor.name
                                : '',
                            skills: item?.tags?.find(
                                (tag) => tag.descriptor.name === 'skill requirement',
                            )?.list[0]?.value
                                ? item.tags.find(
                                    (tag) => tag.descriptor.name === 'skill requirement',
                                )?.list[0].value
                                : null,
                            gender:
                                item?.tags?.find((tag) => tag.descriptor.name === 'Gender') &&
                                    ['Male', 'Female'].includes(
                                        item?.tags?.find((tag) => tag.descriptor.name === 'Gender')
                                            .list[0]?.value,
                                    )
                                    ? item.tags.find((tag) => tag.descriptor.name === 'Gender')
                                        .list[0].value
                                    : null,
                            fulfillments: providers?.fulfillments[index]?.type
                                ? providers.fulfillments[index].type
                                : null,
                            item: item,
                        };
                        arrayOfObjects.push(obj);
                    }
                }
            }
        }
        console.log('arrayOfObjects', arrayOfObjects);
        console.log('arrayOfObjects length', arrayOfObjects.length);
        let uniqueObjects = Array.from(
            new Set(arrayOfObjects.map((obj) => obj.unique_id)),
        ).map((id) => {
            return arrayOfObjects.find((obj) => obj.unique_id === id);
        });
        console.log('uniqueObjects length', uniqueObjects.length);
        //return uniqueObjects
        return this.hasuraService.insertCacheData(uniqueObjects);
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

    async addTelemetry(data) {
        const promises = []
        data.events.map((event) => {
            promises.push(this.hasuraService.addTelemetry({id: data.id, ver: data.ver, events: event}))
            //return {id: data.id, ver: data.ver, events: event}
        } )
        
        //return this.hasuraService.addTelemetry(telemetry_data)
        return Promise.all(promises)
    }
}
