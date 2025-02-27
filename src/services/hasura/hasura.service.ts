import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HasuraService {

  private hasura_url = process.env.HASURA_URL;
  private admin_secret_key = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
  private cache_db = process.env.CACHE_DB;
  private response_cache_db = process.env.RESPONSE_CACHE_DB;
  private jobs_seeker_dev = process.env.JOBS_SEEKER_DEV;
  private jobs_order_dev = process.env.JOBS_ORDER_DEV
  private jobs_telemetry_db = process.env.JOBS_TELEMETRY_DB

  constructor(private httpService: HttpService) {
    console.log("cache_db", this.cache_db)
    console.log("response_cache_db", this.response_cache_db)
  }


  async findContentCache(getContentdto) {
    console.log("searching jobs from " + this.cache_db);

    let whereClause = 'where: {';
    Object.entries(getContentdto).forEach(([key, value]) => {
        console.log(key, ':', value);

        if (Array.isArray(value)) {
            console.log('The value is an array');
            const quotedValues = value.map(city => `"${city}"`).join(", ");

            // Use `_contains` for array fields
            if (["locations", "categories", "fulfillments"].includes(key)) {
                whereClause += `${key}: {_contains: [${quotedValues}]},`;
            } else {
                whereClause += `${key}: {_in: [${quotedValues}]},`;
            }
        } else {
            console.log('The value is not an array');
            whereClause += `${key}: {_eq: "${value}"},`;
        }
    });

    whereClause += '}';
    console.log("whereClause", whereClause);

    const query = `query MyQuery {
        ${this.cache_db}(distinct_on: unique_id, ${whereClause}) {
            id
            unique_id
            bpp_id
            bpp_uri
            provider_id
            provider_name
            item_id
            title
            short_desc
            long_desc
            image
            media
            mimetype
            categories
            fulfillments
            locations
            tags
            created_at
            updated_at
        }
    }`;

    console.log("query=====>", query);
    try {
        const response = await this.queryDb(query);
        return response;
    } catch (error) {
        console.log("error", error);
        throw new HttpException('Unable to Fetch content!', HttpStatus.BAD_REQUEST);
    }
}


  // async findContentCache(getContentdto) {

  //   console.log("searching jobs from " + this.cache_db)


  //   let result = 'where: {';
  //   Object.entries(getContentdto).forEach(([key, value]) => {
  //     console.log(key, ':', value);

  //     if (Array.isArray(value)) {
  //       console.log('The value is an array');
  //       const quotedValues = value.map(city => `"${city}"`).join(", ");
  //       result += `${key}: {_in: [${quotedValues}]},`;
  //     } else {
  //       console.log('The value is not an array');
  //       result += `${key}: {_in: "${value}"},`
  //     }

  //   });
  //   result += '}';
  //   console.log("result", result);
  //   //console.log("order", order)
  //   const query = `query MyQuery {
  //          ${this.cache_db}(distinct_on: unique_id,${result}) {
  //           id
  //           unique_id
  //           bpp_id
  //           bpp_uri
  //           provider_id
  //           provider_name
  //           item_id
  //           title
  //           short_desc
  //           long_desc
  //           image
  //           media
  //           mimetype
  //           categories
  //           fulfillments
  //           locations
  //           tags
  //           created_at
  //           updated_at
  //         }
  //         }`;

  //   console.log("query=====>", query)
  //   try {
  //     const response = await this.queryDb(query);
  //     return response;
  //   } catch (error) {
  //     //this.logger.error("Something Went wrong in creating Admin", error);
  //     console.log("error", error)
  //     throw new HttpException('Unable to Fetch content!', HttpStatus.BAD_REQUEST);
  //   }
  // }

  async searchResponse(data) {

    console.log("searching response from " + this.response_cache_db)

    let result = 'where: {'
    Object.entries(data).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);

      console.log("557", `${key}: ${value}`);
      result += `${key}: {_eq: "${value}"}, `;

    });
    result += '}'
    console.log("result", result)
    //console.log("order", order)
    const query = `query MyQuery {
            ${this.response_cache_db}(${result}) {
                id
                action
                transaction_id
                created_at
                response
          }
          }`;
    try {
      const response = await this.queryDb(query);
      return response;
    } catch (error) {
      //this.logger.error("Something Went wrong in creating Admin", error);
      console.log("error", error)
      throw new HttpException('Unable to Fetch content!', HttpStatus.BAD_REQUEST);
    }
  }

  // async insertCacheData(arrayOfObjects) {
  //   console.log("inserting jobs into " + this.cache_db)
  //   console.log("arrayOfObjects", arrayOfObjects)

  //   const query = `mutation MyMutation($item_id: String, $title: String, $description: String, $company: String, $location_id: String, $city: String, $state: String, $country: String, $qualification: String, $experience: String, $age_criteria: String, $skills: String, $proficiency: String, $work_mode: String, $start_date: String, $end_date: String, $responsiblities: String, $provider_id: String, $provider_name: String, $bpp_id: String, $bpp_uri: String, $unique_id: String, $gender: String, $fulfillments: String, $item: json ) { 
  //           insert_${this.cache_db}(objects: {item_id: $item_id, title: $title, description: $description, company: $company, location_id: $location_id, city: $city, state: $state, country: $country, qualification: $qualification, experience: $experience, age_criteria: $age_criteria, skills: $skills, proficiency: $proficiency, work_mode: $work_mode, start_date: $start_date, end_date: $end_date, responsiblities: $responsiblities, provider_id: $provider_id, provider_name: $provider_name, bpp_id: $bpp_id, bpp_uri: $bpp_uri, unique_id: $unique_id, gender: $gender, fulfillments: $fulfillments, item: $item }) {
  //           returning {
  //             id
  //             item_id
  //             unique_id
  //           }
  //         }
  //       }
  //       `

  //   let promises = []
  //   arrayOfObjects.forEach((item) => {
  //     promises.push(this.queryDb(query, item))
  //   })

  //   let insertApiRes = await Promise.all(promises)
  //   console.log("insertApiRes", insertApiRes)
  //   return insertApiRes

  //   // try {
  //   //   const response = await this.queryDb(query, filteredArray[0] );
  //   //   return response
  //   // } catch (error) {
  //   //   throw new HttpException('Failed to create Content', HttpStatus.NOT_FOUND);
  //   // }

  // }

  async insertCacheData(arrayOfObjects) {
    console.log("Inserting jobs into " + this.cache_db);
    console.log("arrayOfObjects", JSON.stringify(arrayOfObjects, null, 2));

    const query = `
        mutation InsertCacheData(
            $unique_id: String!, $provider_id: String, $provider_name: String,
            $bpp_id: String, $bpp_uri: String, $item_id: String, $title: String,
            $short_desc: String, $long_desc: String, $image: String, $media: String,
            $mimetype: String, $locations: [String!], $categories: [String!], 
            $fulfillments: [String!], $tags: jsonb
        ) { 
            insert_${this.cache_db}(
                objects: {
                    unique_id: $unique_id, provider_id: $provider_id, 
                    provider_name: $provider_name, bpp_id: $bpp_id, 
                    bpp_uri: $bpp_uri, item_id: $item_id, title: $title, 
                    short_desc: $short_desc, long_desc: $long_desc, image: $image, 
                    media: $media, mimetype: $mimetype, locations: $locations, 
                    categories: $categories, fulfillments: $fulfillments, tags: $tags
                }) {
                returning {
                    id
                    item_id
                    unique_id
                    title
                }
            }
        }
    `;

    let promises = arrayOfObjects.map((item) => {
        const variables = {
            unique_id: item.unique_id,
            provider_id: item.provider_id || null,
            provider_name: item.provider_name || null,
            bpp_id: item.bpp_id || null,
            bpp_uri: item.bpp_uri || null,
            item_id: item.item_id || null,
            title: item.title || null,
            short_desc: item.short_desc || null,
            long_desc: item.long_desc || null,
            image: item.image || null,
            media: item.media || null,
            mimetype: item.mimetype || null,
            locations: item.locations && item.locations.length > 0 ? item.locations : null,
            categories: item.categories && item.categories.length > 0 ? item.categories : null,
            fulfillments: item.fulfillments && item.fulfillments.length > 0 ? item.fulfillments : null,
            tags: item.tags && Object.keys(item.tags).length > 0 ? item.tags : null,
        };

        return this.queryDb(query, variables);
    });

    try {
        let insertApiRes = await Promise.all(promises);
        console.log("Insert API Response", insertApiRes);
        return insertApiRes;
    } catch (error) {
        console.error("Error inserting cache data:", error);
        throw new HttpException("Failed to create Content", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}


  async queryDb(query: string, variables?: Record<string, any>): Promise<any> {
    try {
      const response = await axios.post(
        this.hasura_url,
        {
          query,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': this.admin_secret_key
          },
        }
      );
      console.log("response.data", response.data)
      return response.data;
    } catch (error) {
      console.log("error", error)
      return error;

    }
  }

  // async queryDb(query: string, variables?: Record<string, any>): Promise<any> {
  //   try {
  //     const response = await axios.post(
  //       'https://onest-bap.tekdinext.com/hasura/v1/graphql',
  //       {
  //         query,
  //         variables,
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'x-hasura-admin-secret': '#z4X39Q!g1W7fDvX'
  //         },
  //       }
  //     );
  //     console.log("response.data", response.data)
  //     return response.data;
  //   } catch (error) {
  //     console.log("error", error)
  //     return error;

  //   }
  // }

  async getState() {
    const query = `query MyQuery {
            ${this.cache_db}(distinct_on: state,where: { state: { _neq: "" } }) {
              state
            }
          }
        `;

    try {
      return await this.queryDb(query);

    } catch (error) {

      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
  }

  async getCity(state: string) {
    const query = `query MyQuery {
            ${this.cache_db}(distinct_on: city, where: {state: {_eq: "${state}"}}) {
              city
            }
          }
        `;

    try {
      return await this.queryDb(query);

    } catch (error) {

      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
  }

  async getTitle() {
    const query = `query MyQuery {
            ${this.cache_db}(distinct_on: title) {
              title
            }
          }
        `;
    try {
      return await this.queryDb(query);

    } catch (error) {

      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
  }

  async getFilterData(data) {
    const query = `query MyQuery {
            ${this.cache_db}(distinct_on: ${data}) {
              ${data}
            }
          }
        `;
    try {
      return await this.queryDb(query);

    } catch (error) {

      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
  }

  async deleteResponse() {
    const query = `mutation MyMutation {
            delete_${this.response_cache_db}(where: {}) {
              affected_rows
            }
          }
        `;
    try {
      return await this.queryDb(query);

    } catch (error) {

      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
  }

  async deleteJobs() {
    const query = `mutation MyMutation {
            delete_${this.cache_db}(where: {}) {
              affected_rows
            }
          }
        `;
    try {
      return await this.queryDb(query);

    } catch (error) {

      throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
    }
  }

  async createSeekerUser(seeker) {
    const query = `mutation InsertSeeker($user_id: Int, $email: String , $name:String, $age:String, $gender:String, $phone:String) {
     insert_${this.jobs_seeker_dev}(objects: {user_id: $user_id, email: $email, name: $name ,age: $age, gender: $gender, phone: $phone}) {
        affected_rows
        returning {
          id
          email
          name
          gender
          age
          phone
        }
      
    }
    }`;

    console.log(query)

    // Rest of your code to execute the query

    try {
      const response = await this.queryDb(query, seeker)
      return response.data[`insert_${this.jobs_seeker_dev}`].returning[0];
    } catch (error) {
      throw new HttpException('Unabe to creatre Seeker user', HttpStatus.BAD_REQUEST);
    }
  }

  async findSeekerUser(email) {
    const query = `query MyQuery {
      ${this.jobs_seeker_dev}(where: {email: {_eq: "${email}"}}) {
        id
        name
        email
        phone
      }
    }
    `;

    console.log(query)

    // Rest of your code to execute the query

    try {
      const response = await this.queryDb(query)
      return response.data[`${this.jobs_seeker_dev}`][0];
    } catch (error) {
      throw new HttpException('Unabe to create order user', HttpStatus.BAD_REQUEST);
    }
  }

  async createOrder(order) {
    const query = `mutation InsertOrder($content_id: String, $seeker_id: Int, $order_id: String) {
      insert_${this.jobs_order_dev}(objects: {content_id: $content_id, seeker_id: $seeker_id, order_id: $order_id}) {
        affected_rows
        returning {
          content_id
          id
          order_id
          seeker_id
        }
      }
    }
    `;

    // console.log(query)

    // Rest of your code to execute the query

    try {
      const response = await this.queryDb(query, order)
      return response;
    } catch (error) {
      throw new HttpException('Unabe to create order user', HttpStatus.BAD_REQUEST);
    }
  }

  async searchOrderByOrderId(order) {
    console.log("order", order)
    const query = `query MyQuery {
      ${this.jobs_order_dev}(where: {order_id: {_eq: "${order}"}}) {
        OrderContentRelationship {
          bpp_id
          bpp_uri
          id
          provider_id
          provider_name
         
        }
      }
    }
    `;

    //console.log(query)

    // Rest of your code to execute the query

    try {
      const response = await this.queryDb(query)
      return response.data[`${this.jobs_order_dev}`][0].OrderContentRelationship[0]
    } catch (error) {
      throw new HttpException('Invalid order id', HttpStatus.BAD_REQUEST);
    }
  }

  async addTelemetry(data) {
    console.log("data", data)
    const query = `
      mutation ($id: String, $ver: String, $events:jsonb) {
        insert_${this.jobs_telemetry_db}(objects: [{id: $id, ver: $ver, events: $events}]) {
          returning {
            id
            events
          }
        }
      }
    `;

    console.log(query)

    try {
      const response = await this.queryDb(query, data)
      return response;
    } catch (error) {
      throw new HttpException('Unabe to add telemetry', HttpStatus.BAD_REQUEST);
    }
  }


}
