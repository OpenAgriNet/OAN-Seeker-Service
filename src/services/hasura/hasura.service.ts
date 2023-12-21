import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HasuraService {

    private hasurastate = process.env.HASURA_state;
    private adminSecretKey = process.env.HASURA_GRAPHQL_ADMIN_SECRET;

    constructor(private httpService: HttpService) { }

    async findJobsCache(getContentdto) {


        let result = 'where: {'
        Object.entries(getContentdto).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
            if (key == 'age_criteria' || key == 'country' || key == 'qualification' || key == 'state') {
                result += `${key}: {_contains: "${value}"}, `;
            } else {
                console.log("557", `${key}: ${value}`);
                result += `${key}: {_eq: "${value}"}, `;
            }

        });
        result += '}'
        console.log("result", result)
        //console.log("order", order)
        const query = `query MyQuery {
           jobs_cache(distinct_on: item_id,${result}) {
            age_criteria
            city
            comapany
            item_id
            country
            description
            employee_type
            end_date
            experience
            gender
            id
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
          }
          }`;
        try {
            const response = await this.queryDb(query);
            return response;
        } catch (error) {
            //this.logger.error("Something Went wrong in creating Admin", error);
            throw new HttpException('Unable to Fetch content!', HttpStatus.BAD_REQUEST);
        }
    }

    async insertCacheData(arrayOfObjects) {
        console.log("arrayOfObjects", arrayOfObjects)
        // $provider_id: String, provider_name: String, bpp_id: String, bpp_uri: String
        // provider_id: $provider_id, provider_name: $provider_name, bpp_id: $bpp_id, bpp_uri: $bpp_uri
        const query = `mutation MyMutation($item_id: String, $title: String, $description: String, $comapany: String, $location_id: String, $city: String, $state: String, $country: String, $qualification: String, $experience: String, $age_criteria: String, $skills: String, $proficiency: String, $work_mode: String, $start_date: String, $end_date: String, $responsiblities: String, $provider_id: String, $provider_name: String, $bpp_id: String, $bpp_uri: String ) { 
            insert_jobs_cache(objects: {item_id: $item_id, title: $title, description: $description, comapany: $comapany, location_id: $location_id, city: $city, state: $state, country: $country, qualification: $qualification, experience: $experience, age_criteria: $age_criteria, skills: $skills, proficiency: $proficiency, work_mode: $work_mode, start_date: $start_date, end_date: $end_date, responsiblities: $responsiblities, provider_id: $provider_id, provider_name: $provider_name, bpp_id: $bpp_id, bpp_uri: $bpp_uri }) {
            returning {
              id
              item_id
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
}
