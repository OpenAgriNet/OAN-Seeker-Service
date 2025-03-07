import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class LocationService {
    private readonly STATE_TRANSLATIONS = {
        "1": { en: "Andaman and Nicobar Islands", hi: "अंडमान और निकोबार", mr: "अंदमान आणि निकोबार" },
        "2": { en: "Andhra Pradesh", hi: "आंध्र प्रदेश", mr: "आंध्र प्रदेश" },
        "3": { en: "Arunachal Pradesh", hi: "अरुणाचल प्रदेश", mr: "अरुणाचल प्रदेश" },
        "4": { en: "Assam", hi: "असम", mr: "आसाम" },
        "5": { en: "Bihar", hi: "बिहार", mr: "बिहार" },
        "6": { en: "Chandigarh", hi: "चंडीगढ़", mr: "चंदीगड" },
        "7": { en: "Chhattisgarh", hi: "छत्तीसगढ़", mr: "छत्तीसगड" },
        "8": { en: "Dadra and Nagar Haveli", hi: "दादरा और नगर हवेली", mr: "दादरा आणि नगर हवेली" },
        "37": { en: "Daman and Diu", hi: "दमन और दीव", mr: "दमन आणि दीव" },
        "9": { en: "Delhi", hi: "दिल्ली", mr: "दिल्ली" },
        "10": { en: "Goa", hi: "गोवा", mr: "गोवा" },
        "11": { en: "Gujarat", hi: "गुजरात", mr: "गुजरात" },
        "12": { en: "Haryana", hi: "हरियाणा", mr: "हरियाणा" },
        "13": { en: "Himachal Pradesh", hi: "हिमाचल प्रदेश", mr: "हिमाचल प्रदेश" },
        "14": { en: "Jammu and Kashmir", hi: "जम्मू और कश्मीर", mr: "जम्मू आणि कश्मीर" },
        "15": { en: "Jharkhand", hi: "झारखंड", mr: "झारखंड" },
        "16": { en: "Karnataka", hi: "कर्नाटक", mr: "कर्नाटक" },
        "17": { en: "Kerala", hi: "केरल", mr: "केरळ" },
        "18": { en: "Ladakh", hi: "लद्दाख", mr: "लडाख" },
        "19": { en: "Lakshadweep", hi: "लक्षद्वीप", mr: "लक्षद्वीप" },
        "20": { en: "Madhya Pradesh", hi: "मध्य प्रदेश", mr: "मध्य प्रदेश" },
        "21": { en: "Maharashtra", hi: "महाराष्ट्र", mr: "महाराष्ट्र" },
        "22": { en: "Manipur", hi: "मणिपुर", mr: "मणिपूर" },
        "23": { en: "Meghalaya", hi: "मेघालय", mr: "मेघालय" },
        "24": { en: "Mizoram", hi: "मिजोरम", mr: "मिझोरम" },
        "25": { en: "Nagaland", hi: "नागालैंड", mr: "नागालँड" },
        "26": { en: "Odisha", hi: "ओडिशा", mr: "ओडिशा" },
        "27": { en: "Puducherry", hi: "पुदुचेरी", mr: "पुडुचेरी" },
        "28": { en: "Punjab", hi: "पंजाब", mr: "पंजाब" },
        "29": { en: "Rajasthan", hi: "राजस्थान", mr: "राजस्थान" },
        "30": { en: "Sikkim", hi: "सिक्किम", mr: "सिक्किम" },
        "31": { en: "Tamil Nadu", hi: "तमिलनाडु", mr: "तमिळनाडू" },
        "32": { en: "Telangana", hi: "तेलंगाना", mr: "तेलंगणा" },
        "33": { en: "Tripura", hi: "त्रिपुरा", mr: "त्रिपुरा" },
        "34": { en: "Uttar Pradesh", hi: "उत्तर प्रदेश", mr: "उत्तर प्रदेश" },
        "35": { en: "Uttarakhand", hi: "उत्तराखंड", mr: "उत्तराखंड" },
        "36": { en: "West Bengal", hi: "पश्चिम बंगाल", mr: "पश्चिम बंगाल" }
    };


    private readonly OPENWEATHER_API_KEY = process.env.API_KEY;

    // Fetch states
    async getStates(lang: string = 'en') {
        try {
            const response = await axios.get('https://cdn-api.co-vin.in/api/v2/admin/location/states');

            return response.data.states.map((state) => {
                const en = this.STATE_TRANSLATIONS[state.state_id]?.en || state.state_name;
                const state_name = this.STATE_TRANSLATIONS[state.state_id]?.[lang] || en; // Use English if no translation exists

                return { state_id: state.state_id, state_name, en };
            });
        } catch (error) {
            throw new HttpException('Failed to fetch states', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Fetch districts
    async getDistricts(state_id: number, lang: string = 'en') {
        try {
            const response = await axios.get(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${state_id}`);

            const districts = (
                await Promise.all(
                    response.data.districts.map(async (district) => {
                        const en = district.district_name; // Original district name in English
                        const translatedName = await this.getTranslatedName(en, lang);

                        // If district_name is missing, discard this entry
                        if (!translatedName) return null;

                        return { district_id: district.district_id, district_name: translatedName, en };
                    })
                )
            ).filter((district) => district !== null); // Remove null values

            return districts;
        } catch (error) {
            throw new HttpException('Failed to fetch districts', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Fetch translated name using OpenWeather API
    async getTranslatedName(name: string, lang: string): Promise<string | null> {
        try {
            const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(name)}&limit=1&appid=${this.OPENWEATHER_API_KEY}`);
            return response.data[0]?.local_names?.[lang] || null;
        } catch (error) {
            return null;
        }
    }

}
