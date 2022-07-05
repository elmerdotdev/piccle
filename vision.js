export default class Vision {
    constructor (base64Image) {
        this.image = base64Image,
        this.apiKey = "https://vision.googleapis.com/v1/images:annotate?key=" + 'AIzaSyAISbg6ujMBUkFhb1CP6451dsaxTHMM7Gk'
    }

    async cloudVision() {
        let results = []

        const res = await fetch(this.apiKey, {
            method: "POST",
            body: JSON.stringify({
                "requests":[
                    {
                        "image":{
                            "content": this.image
                        },
                        "features":[
                            {
                                "type":"LABEL_DETECTION",
                                "maxResults": 10
                            },
                            {
                                "type": "LOGO_DETECTION"
                            }
                        ]
                    }
                ]
            })
        });

        const data = await res.json()
        
        for (let annotations in data.responses[0]) {
            for (let prop of data.responses[0][annotations]) {
                results.push(prop.description.toLowerCase())
            }
        }

        return results
    }
}