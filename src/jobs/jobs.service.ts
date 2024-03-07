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
    private response_cache_db = process.env.RESPONSE_CACHE_DB;

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

    async selectResponseCache(filters) {
        console.log('filters', filters);

        const query1 = `
        SELECT *
        FROM response_cache_dev
        WHERE response->'context'->>'action'='on_confirm';
        `;

        const query2 = `
        SELECT *
        FROM response_cache_dev
        CROSS JOIN LATERAL json_array_elements(response->'message'->'order'->'fulfillments') AS fulfillment
        WHERE fulfillment->'customer'->'person'->>'gender' = 'Female'
        AND response->'context'->>'action'='on_confirm'
        `;

        const query3 = `
        SELECT *
        FROM response_cache_dev
        CROSS JOIN LATERAL json_array_elements(response->'message'->'order'->'fulfillments') AS fulfillment
        WHERE fulfillment->'customer'->'person'->>'gender' = 'Female'
        AND response->'context'->>'action'='on_confirm'
        AND response->'message'->'order'->'provider'->'descriptor'->>'name' = 'tibil'
        `;

        const query4 = `
        WITH confirm_actions AS (
            SELECT *
            FROM response_cache_dev
            WHERE response->'context'->>'action' = 'on_confirm'
        )
        SELECT *
        FROM confirm_actions
        CROSS JOIN LATERAL json_array_elements(confirm_actions.response->'message'->'order'->'fulfillments') AS fulfillment
        WHERE fulfillment->'customer'->'person'->>'gender' = 'Female'
        AND confirm_actions.response->'message'->'order'->'provider'->'descriptor'->>'name' = 'tibil';        
        `;

        const query5 = `
        WITH confirm_actions AS (
            SELECT *
            FROM response_cache_dev
            WHERE response->'context'->>'action' = 'on_confirm'
            AND response->'message'->'order'->'provider'->'descriptor'->>'name' = 'tibil'
            AND createdat BETWEEN '2024-01-01' AND '2024-02-29'
        )
        SELECT *
        FROM confirm_actions
        CROSS JOIN LATERAL json_array_elements(confirm_actions.response->'message'->'order'->'fulfillments') AS fulfillment
        WHERE fulfillment->'customer'->'person'->>'gender' = 'Female'       
        `;

        const query6 = `
        WITH confirm_actions AS (
            SELECT *
            FROM response_cache_dev
            WHERE response->'context'->>'action' = 'on_confirm'
            AND response->'message'->'order'->'provider'->'descriptor'->>'name' = 'tibil'
            AND createdat BETWEEN '2024-01-01' AND '2024-02-29'
        )
        SELECT *
        FROM confirm_actions
        CROSS JOIN LATERAL json_array_elements(confirm_actions.response->'message'->'order'->'fulfillments') AS fulfillment
        WHERE fulfillment->'customer'->'person'->>'gender' = 'female'
        AND fulfillment->'customer'->'contact'->>'phone' = '9822334455'
        AND fulfillment->'customer'->'contact'->>'email' = 'alice@gmail.com'
        `;

        const generatedQuery = this.generateQuery(filters);
        console.log(generatedQuery);

        return await this.responseCacheRepository.query(generatedQuery);

    }

    generateQuery(filters) {
        let query = `
            SELECT *
            FROM response_cache_dev`;
    
        if (filters.action) {
            query += `
            WHERE response->'context'->>'action' = '${filters.action}'`;
        }
    
        if (filters.order_id) {
            query += `
            AND response->'message'->'order'->>'id' = '${filters.order_id}'`;
        }
    
        if (filters.provider_name) {
            query += `
            AND response->'message'->'order'->'provider'->'descriptor'->>'name' = '${filters.provider_name}'`;
        }
    
        if (filters.created_at) {
            query += `
            AND created_at BETWEEN '${filters.created_at.from}' AND '${filters.created_at.to}' 
            `;
        }

        if (filters.gender) {
            if(this.hasWhereKeyword(query)) {
                query += `
                AND fulfillment->'customer'->'person'->>'gender' = '${filters.gender}'
                `
            }
            query = `
            WITH confirm_actions AS (
                ${query}
            )
            SELECT *
            FROM confirm_actions
            CROSS JOIN LATERAL json_array_elements(confirm_actions.response->'message'->'order'->'fulfillments') AS fulfillment
            WHERE fulfillment->'customer'->'person'->>'gender' = '${filters.gender}'
            `;
        }

        if(filters.phone) {

            if(this.hasWhereKeyword(query)) {
                query += `
                AND fulfillment->'customer'->'contact'->>'phone' = '${filters.phone}'
                `;
            } else {
                query = `
                WITH confirm_actions AS (
                    ${query}
                )
                SELECT *
                FROM confirm_actions
                CROSS JOIN LATERAL json_array_elements(confirm_actions.response->'message'->'order'->'fulfillments') AS fulfillment
                WHERE fulfillment->'customer'->'contact'->>'phone' = '${filters.phone}'
                `;
            }

        }if(filters.email) {

            if(this.hasWhereKeyword(query)) {
                query += `
                AND fulfillment->'customer'->'contact'->>'email' = '${filters.email}'
                `;
            } else {
                query = `
                WITH confirm_actions AS (
                    ${query}
                )
                SELECT *
                FROM confirm_actions
                CROSS JOIN LATERAL json_array_elements(confirm_actions.response->'message'->'order'->'fulfillments') AS fulfillment
                WHERE fulfillment->'customer'->'contact'->>'email' = '${filters.email}'
                `;
            }

        }




    
        return query;
    }

    hasWhereKeyword(queryString) {
        return queryString.toLowerCase().includes('fulfillment');
    }

    generateFixedId(...strings) {
        const combinedString = strings.join('-'); // Combine strings using a separator
        const hash = crypto
            .createHash('sha256')
            .update(combinedString)
            .digest('hex');
        return hash;
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
            promises.push(this.hasuraService.addTelemetry({ id: data.id, ver: data.ver, events: event }))
            //return {id: data.id, ver: data.ver, events: event}
        })

        //return this.hasuraService.addTelemetry(telemetry_data)
        return Promise.all(promises)
    }

    async analytics(body) {

        // let response = await  this.hasuraService.searchResponse({"action": "on_confirm"});
        // console.log("response", response.data.response_cache_dev)
        // let analytics =  response.data[`${this.response_cache_db}`]
        //let analytics =  response.data[`${this.response_cache_db}`]

        let response = await this.selectResponseCache(body);

        //console.log("response", response)
        //return response

        let analytics = response

        let arrayOfObj = analytics.map((item) => {
            let obj = {
                order_id: item.response.message.order.id,
                action: item.action,
                transaction_id: item.transaction_id,
                bpp_id: item.response.context.bpp_id,
                bpp_uri: item.response.context.bpp_uri,
                customer_email: item.response.message.order.fulfillments[0].customer.contact.email,
                customer_phone: item.response.message.order.fulfillments[0].customer.contact.phone,
                customer_name: item.response.message.order.fulfillments[0].customer.person.name,
                customer_gender: item.response.message.order.fulfillments[0].customer.person.gender,
                provider_name: item.response.message.order?.provider?.descriptor?.name ? item.response.message.order.provider.descriptor.name : "",
                job_id: item.response.message.order?.items[0]?.id ? item.response.message.order.items[0].id : "",
                job_name: item.response.message.order?.items[0]?.descriptor?.name ? item.response.message.order.items[0].descriptor.name : "",
                content_creater_name: item.response.message.order?.items[0]?.creator?.descriptor?.name ? item.response.message.order.items[0].creator.descriptor.name : "",
                distributor_name: item.response.message.order.fulfillments[0].customer.person.tags.find((tag) => tag.code === 'distributor-details').list[0]?.value ? item.response.message.order.fulfillments[0].customer.person.tags.find((tag) => tag.code === 'distributor-details').list[0].value : "",
                agent_id: item.response.message.order.fulfillments[0].customer.person.tags.find((tag) => tag.code === 'distributor-details').list[1]?.value ? item.response.message.order.fulfillments[0].customer.person.tags.find((tag) => tag.code === 'distributor-details').list[1].value : "",
                create_at: item.created_at,

            }
            return obj
        })

        //console.log("arrayOfObj", arrayOfObj)

        //return arrayOfObj;

        let uniqueObjects = Array.from(
            new Set(arrayOfObj.map((obj) => obj.order_id)),
        ).map((id) => {
            return arrayOfObj.find((obj) => obj.order_id === id);
        });

        return uniqueObjects;

    }
}
