import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HasuraService {

  private hasurastate = process.env.HASURA_state;
  private adminSecretKey = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
  private cache_db = process.env.CACHE_DB;
  private response_cache_db = process.env.RESPONSE_CACHE_DB;
  private jobs_seeker_dev = process.env.JOBS_SEEKER_DEV;
  private jobs_order_dev = process.env.JOBS_ORDER_DEV

  constructor(private httpService: HttpService) {
    console.log("cache_db", this.cache_db)
    console.log("response_cache_db", this.response_cache_db)
  }

  async findJobsCache(getContentdto) {

    console.log("searching jobs from " + this.cache_db)


    let result = 'where: {'
    Object.entries(getContentdto).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);

      console.log("557", `${key}: ${value}`);
      result += `${key}: {_eq: "${value}"}, `;


    });
    result += '}'
    console.log("result", result)
    //console.log("order", order)
    const query = `query MyQuery {
           ${this.cache_db}(distinct_on: unique_id,${result}) {
            id
            unique_id
            age_criteria
            city
            company
            item_id
            country
            description
            employee_type
            end_date
            experience
            gender
            location_id
            proficiency
            qualification
            responsiblities
            salary
            skills
            start_date
            state
            title
            work_mode
            provider_id
            provider_name
            bpp_id
            bpp_uri
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

  async insertCacheData(arrayOfObjects) {
    console.log("inserting jobs into " + this.cache_db)
    console.log("arrayOfObjects", arrayOfObjects)
    // $provider_id: String, provider_name: String, bpp_id: String, bpp_uri: String
    // provider_id: $provider_id, provider_name: $provider_name, bpp_id: $bpp_id, bpp_uri: $bpp_uri
    const query = `mutation MyMutation($item_id: String, $title: String, $description: String, $company: String, $location_id: String, $city: String, $state: String, $country: String, $qualification: String, $experience: String, $age_criteria: String, $skills: String, $proficiency: String, $work_mode: String, $start_date: String, $end_date: String, $responsiblities: String, $provider_id: String, $provider_name: String, $bpp_id: String, $bpp_uri: String, $unique_id: String ) { 
            insert_${this.cache_db}(objects: {item_id: $item_id, title: $title, description: $description, company: $company, location_id: $location_id, city: $city, state: $state, country: $country, qualification: $qualification, experience: $experience, age_criteria: $age_criteria, skills: $skills, proficiency: $proficiency, work_mode: $work_mode, start_date: $start_date, end_date: $end_date, responsiblities: $responsiblities, provider_id: $provider_id, provider_name: $provider_name, bpp_id: $bpp_id, bpp_uri: $bpp_uri, unique_id: $unique_id }) {
            returning {
              id
              item_id
              unique_id
            }
          }
        }
        `

    let promises = []
    arrayOfObjects.forEach((item) => {
      promises.push(this.queryDb(query, item))
    })

    let insertApiRes = await Promise.all(promises)
    console.log("insertApiRes", insertApiRes)
    return insertApiRes

    // try {
    //   const response = await this.queryDb(query, filteredArray[0] );
    //   return response
    // } catch (error) {
    //   throw new HttpException('Failed to create Content', HttpStatus.NOT_FOUND);
    // }

  }

  async queryDb(query: string, variables?: Record<string, any>): Promise<any> {
    try {
      const response = await axios.post(
        'https://onest-bap.tekdinext.com/hasura/v1/graphql',
        {
          query,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': '#z4X39Q!g1W7fDvX'
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
      const response = await this.queryDb(query,order)
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
      return response;
    } catch (error) {
      throw new HttpException('Unabe to create order user', HttpStatus.BAD_REQUEST);
    }
  }


}
