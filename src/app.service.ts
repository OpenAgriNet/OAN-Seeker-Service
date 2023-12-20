import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    var data = [
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
      // ... (other objects)
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
    ];

    // function getCityNameById(id) {
    //   const item = data.find(item => item.id === id);
    //   return item ? item.city.name : null;
    // }

    // // Example usage:
    // const cityName = getCityNameById("1");
    // console.log(cityName); // Output: Bangalore
    var id = "1";
    // const getCityNameById = data.find((item) => {
    //   if(item.id === id) {
        
    //     return item ? item.city.name : null;
    //   }
    // })
    const getCityNameById = data.find(item => item.id === id) ? data.find(item => item.id === id).city.name : null;
    console.log("getCityNameById", getCityNameById)
    return 'Jobs-backend is running!';
  }
}
