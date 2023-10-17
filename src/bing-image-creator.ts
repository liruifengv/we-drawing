
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const BING_URL: string = process.env.BING_URL || "https://www.bing.com";

// Generate random IP between range 13.104.0.0/14
const FORWARDED_IP: string = `13.${Math.floor(Math.random() * 4) + 104}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
const HEADERS: {[key: string]: string} = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "max-age=0",
  "content-type": "application/x-www-form-urlencoded",
  "referrer": "https://www.bing.com/images/create/",
  "origin": "https://www.bing.com",
  "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63",
};


export class BingImageCreator {
  /**
   * Image generation by Microsoft Bing
   * @param cookie - Authentication cookie
   */
  protected _cookie: string
  constructor({ cookie }: { cookie: string }) {
    console.log(`cookie: ${cookie}`);
    this._cookie = cookie

    if (!this._cookie) {
      throw new Error('Bing cookie is required')
    }
  }

  async createImage(prompt: string) {
    const cookie = this._cookie;
    console.log('cookie', cookie)
    const encodedPrompt = encodeURIComponent(prompt)
    let formData = new FormData();
    formData.append("q", encodedPrompt);
    formData.append("qa", "ds");
    console.log("Sending request...")
    const url = `${BING_URL}/images/create?q=${encodedPrompt}&rt=3&FORM=GENCRE`

    return fetch(url, {
      headers: {
        cookie,
        ...HEADERS,
      },
      body: formData,
      method: 'POST',
      mode: 'cors',
      redirect: "manual", // set to manual to prevent redirect
    }).then(async (res) => {
      if (res.ok) {
        // 200 is failed
        throw new Error('Request failed');
      } else {
        // 302 is success
        const redirect_url = res.headers.get("location").replace("&nfy=1", "");
        const request_id = redirect_url.split("id=")[1];
        console.log('redirect_url', redirect_url);
        console.log('request_id', request_id);
        try {
          await fetch(`${BING_URL}${redirect_url}`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
          })
        } catch (e) {
          throw new Error('Request failed2', e);
        }

        const getResultUrl = `${BING_URL}/images/create/async/results/${request_id}?q=${encodedPrompt}`
        const start_wait = Date.now();
        let result = "";
        while (true) {
            if (Date.now() - start_wait > 200000) {
                throw new Error('Timeout');
            }

            await sleep(1000)
            result = await this.getResults(getResultUrl);
            if (result) {
                break;
            }
        }
        return this.parseResult(result);

      }
    })
  }

  async getResults(getResultUrl: string) {
    const response = await fetch(getResultUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    });
    if (response.status !== 200) {
        throw new Error('Bad status code');
    }
    const content = await response.text();
    console.log('content', content);
    if (!content || content.includes("errorMessage")) {
        return null
    } else {
        return content;
    }
  }
  parseResult(result: string) {
      // Use regex to search for src=""
      const regex = /src="([^"]*)"/g;
      const matches = result.match(regex);
      // # Remove size limit
      const normal_image_links = matches.map((link) => {
          return link.split("?w=")[0];
      });
      // Remove duplicates
      const unique_image_links = [...new Set(normal_image_links)];
      const bad_images = [
          "https://r.bing.com/rp/in-2zU3AJUdkgFe7ZKv19yPBHVs.png",
          "https://r.bing.com/rp/TX9QuO3WzcCJz1uaaSwQAz39Kb0.jpg",
      ];
      for (const img of unique_image_links) {
          if (bad_images.includes(img)) {
              throw new Error("Bad images");
          }
      }
      // No images
      if (unique_image_links.length === 0) {
          throw new Error("error_no_images");
      }
      return unique_image_links;
  }
}