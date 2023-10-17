import argparse
import asyncio
import contextlib
import json
import os
import random
import sys
import time
from functools import partial
from http.cookies import SimpleCookie
from typing import Dict, List, Union

import httpx
import pkg_resources
import regex
import requests
from requests.utils import cookiejar_from_dict

BING_URL = os.getenv("BING_URL", "https://www.bing.com")
# Generate random IP between range 13.104.0.0/14
FORWARDED_IP = (
    f"13.{random.randint(104, 107)}.{random.randint(0, 255)}.{random.randint(0, 255)}"
)
HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "content-type": "application/x-www-form-urlencoded",
    "referrer": "https://www.bing.com/images/create/",
    "origin": "https://www.bing.com",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63",
    "x-forwarded-for": FORWARDED_IP,
}

# Error messages
error_timeout = "Your request has timed out."
error_redirect = "Redirect failed"
error_blocked_prompt = (
    "Your prompt has been blocked by Bing. Try to change any bad words and try again."
)
error_being_reviewed_prompt = "Your prompt is being reviewed by Bing. Try to change any sensitive words and try again."
error_noresults = "Could not get results"
error_unsupported_lang = "\nthis language is currently not supported by bing"
error_bad_images = "Bad images"
error_no_images = "No images"
# Action messages
sending_message = "Sending request..."
wait_message = "Waiting for results..."
download_message = "\nDownloading images..."


def debug(debug_file, text_var):
    """helper function for debug"""
    with open(f"{debug_file}", "a", encoding="utf-8") as f:
        f.write(str(text_var))
        f.write("\n")


class ImageGen:
    """
    Image generation by Microsoft Bing
    Parameters:
        auth_cookie: str
    Optional Parameters:
        debug_file: str
        quiet: bool
        all_cookies: List[Dict]
    """

    def __init__(
        self,
        auth_cookie: str,
        debug_file: Union[str, None] = None,
        quiet: bool = False,
        all_cookies: List[Dict] = None,
    ) -> None:
        print(f"auth_cookie: {auth_cookie}")
        self.session: requests.Session = requests.Session()
        self.session.headers = HEADERS
        self.session.cookies = self.parse_cookie_string(auth_cookie)
        print(f"self.session.cookies: {self.session.cookies}")
        self.quiet = quiet
        self.debug_file = debug_file
        if self.debug_file:
            self.debug = partial(debug, self.debug_file)

    @staticmethod
    def parse_cookie_string(cookie_string):
        cookie = SimpleCookie()
        cookie.load(cookie_string)
        cookies_dict = {}
        cookiejar = None
        print(f"cookie: {cookie.items()}")
        for key, morsel in cookie.items():
            print(f"key: {key}, morsel: {morsel}")
            cookies_dict[key] = morsel.value
            cookiejar = cookiejar_from_dict(
                cookies_dict, cookiejar=None, overwrite=True
            )
        return cookiejar

    def get_images(self, prompt: str) -> list:
        """
        Fetches image links from Bing
        Parameters:
            prompt: str
        """
        if not self.quiet:
            print(sending_message)
        if self.debug_file:
            self.debug(sending_message)
        url_encoded_prompt = requests.utils.quote(prompt)
        payload = f"q={url_encoded_prompt}&qs=ds"
        # https://www.bing.com/images/create?q=<PROMPT>&rt=3&FORM=GENCRE
        url = f"{BING_URL}/images/create?q={url_encoded_prompt}&rt=4&FORM=GENCRE"
        response = self.session.post(
            url,
            allow_redirects=False,
            data=payload,
            timeout=200,
        )
        # check for content waring message
        if "this prompt is being reviewed" in response.text.lower():
            if self.debug_file:
                self.debug(f"ERROR: {error_being_reviewed_prompt}")
            raise Exception(
                error_being_reviewed_prompt,
            )
        if "this prompt has been blocked" in response.text.lower():
            if self.debug_file:
                self.debug(f"ERROR: {error_blocked_prompt}")
            raise Exception(
                error_blocked_prompt,
            )
        if (
            "we're working hard to offer image creator in more languages"
            in response.text.lower()
        ):
            if self.debug_file:
                self.debug(f"ERROR: {error_unsupported_lang}")
            raise Exception(error_unsupported_lang)
        if response.status_code != 302:
            # if rt4 fails, try rt3
            url = f"{BING_URL}/images/create?q={url_encoded_prompt}&rt=3&FORM=GENCRE"
            response = self.session.post(url, allow_redirects=False, timeout=200)
            if response.status_code != 302:
                if self.debug_file:
                    self.debug(f"ERROR: {error_redirect}")
                print(f"ERROR: {response.text}")
                raise Exception(error_redirect)
        # Get redirect URL
        redirect_url = response.headers["Location"].replace("&nfy=1", "")
        request_id = redirect_url.split("id=")[-1]
        self.session.get(f"{BING_URL}{redirect_url}")
        # https://www.bing.com/images/create/async/results/{ID}?q={PROMPT}
        polling_url = f"{BING_URL}/images/create/async/results/{request_id}?q={url_encoded_prompt}"
        # Poll for results
        if self.debug_file:
            self.debug("Polling and waiting for result")
        if not self.quiet:
            print("Waiting for results...")
        start_wait = time.time()
        while True:
            if int(time.time() - start_wait) > 200:
                if self.debug_file:
                    self.debug(f"ERROR: {error_timeout}")
                raise Exception(error_timeout)
            if not self.quiet:
                print(".", end="", flush=True)
            response = self.session.get(polling_url)
            if response.status_code != 200:
                if self.debug_file:
                    self.debug(f"ERROR: {error_noresults}")
                raise Exception(error_noresults)
            if not response.text or response.text.find("errorMessage") != -1:
                time.sleep(1)
                continue
            else:
                break
        # Use regex to search for src=""
        image_links = regex.findall(r'src="([^"]+)"', response.text)
        # Remove size limit
        normal_image_links = [link.split("?w=")[0] for link in image_links]
        # Remove duplicates
        normal_image_links = list(set(normal_image_links))

        # Bad images
        bad_images = [
            "https://r.bing.com/rp/in-2zU3AJUdkgFe7ZKv19yPBHVs.png",
            "https://r.bing.com/rp/TX9QuO3WzcCJz1uaaSwQAz39Kb0.jpg",
        ]
        for img in normal_image_links:
            if img in bad_images:
                raise Exception("Bad images")
        # No images
        if not normal_image_links:
            raise Exception(error_no_images)
        return normal_image_links

    def save_images(
        self,
        links: list,
        output_dir: str,
        file_name: str = None,
        download_count: int = None,
    ) -> None:
        """
        Saves images to output directory
        Parameters:
            links: list[str]
            output_dir: str
            file_name: str
            download_count: int
        """
        if self.debug_file:
            self.debug(download_message)
        if not self.quiet:
            print(download_message)
        with contextlib.suppress(FileExistsError):
            os.mkdir(output_dir)
        try:
            fn = f"{file_name}_" if file_name else ""
            jpeg_index = 0

            if download_count:
                links = links[:download_count]

            for link in links:
                while os.path.exists(
                    os.path.join(output_dir, f"{fn}{jpeg_index}.jpeg")
                ):
                    jpeg_index += 1
                response = self.session.get(link)
                if response.status_code != 200:
                    raise Exception("Could not download image")
                # save response to file
                with open(
                    os.path.join(output_dir, f"{fn}{jpeg_index}.jpeg"), "wb"
                ) as output_file:
                    output_file.write(response.content)
                jpeg_index += 1

        except requests.exceptions.MissingSchema as url_exception:
            raise Exception(
                "Inappropriate contents found in the generated images. Please try again or try another prompt.",
            ) from url_exception


class ImageGenAsync:
    """
    Image generation by Microsoft Bing
    Parameters:
        auth_cookie: str
    Optional Parameters:
        debug_file: str
        quiet: bool
        all_cookies: list[dict]
    """

    def __init__(
        self,
        auth_cookie: str = None,
        debug_file: Union[str, None] = None,
        quiet: bool = False,
        all_cookies: List[Dict] = None,
    ) -> None:
        if auth_cookie is None and not all_cookies:
            raise Exception("No auth cookie provided")
        self.session = httpx.AsyncClient(
            headers=HEADERS,
            trust_env=True,
        )
        if auth_cookie:
            self.session.cookies.update({"_U": auth_cookie})
        if all_cookies:
            for cookie in all_cookies:
                self.session.cookies.update(
                    {cookie["name"]: cookie["value"]},
                )
        self.quiet = quiet
        self.debug_file = debug_file
        if self.debug_file:
            self.debug = partial(debug, self.debug_file)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *excinfo) -> None:
        await self.session.aclose()

    async def get_images(self, prompt: str) -> list:
        """
        Fetches image links from Bing
        Parameters:
            prompt: str
        """
        if not self.quiet:
            print("Sending request...")
        url_encoded_prompt = requests.utils.quote(prompt)
        # https://www.bing.com/images/create?q=<PROMPT>&rt=3&FORM=GENCRE
        url = f"{BING_URL}/images/create?q={url_encoded_prompt}&rt=3&FORM=GENCRE"
        payload = f"q={url_encoded_prompt}&qs=ds"
        response = await self.session.post(
            url,
            follow_redirects=False,
            data=payload,
        )
        content = response.text
        if "this prompt has been blocked" in content.lower():
            raise Exception(
                "Your prompt has been blocked by Bing. Try to change any bad words and try again.",
            )
        if response.status_code != 302:
            # if rt4 fails, try rt3
            url = f"{BING_URL}/images/create?q={url_encoded_prompt}&rt=4&FORM=GENCRE"
            response = await self.session.post(
                url,
                follow_redirects=False,
                timeout=200,
            )
            if response.status_code != 302:
                print(f"ERROR: {response.text}")
                raise Exception("Redirect failed")
        # Get redirect URL
        redirect_url = response.headers["Location"].replace("&nfy=1", "")
        request_id = redirect_url.split("id=")[-1]
        await self.session.get(f"{BING_URL}{redirect_url}")
        # https://www.bing.com/images/create/async/results/{ID}?q={PROMPT}
        polling_url = f"{BING_URL}/images/create/async/results/{request_id}?q={url_encoded_prompt}"
        # Poll for results
        if not self.quiet:
            print("Waiting for results...")
        while True:
            if not self.quiet:
                print(".", end="", flush=True)
            # By default, timeout is 300s, change as needed
            response = await self.session.get(polling_url)
            if response.status_code != 200:
                raise Exception("Could not get results")
            content = response.text
            if content and content.find("errorMessage") == -1:
                break

            await asyncio.sleep(1)
            continue
        # Use regex to search for src=""
        image_links = regex.findall(r'src="([^"]+)"', content)
        # Remove size limit
        normal_image_links = [link.split("?w=")[0] for link in image_links]
        # Remove duplicates
        normal_image_links = list(set(normal_image_links))

        # Bad images
        bad_images = [
            "https://r.bing.com/rp/in-2zU3AJUdkgFe7ZKv19yPBHVs.png",
            "https://r.bing.com/rp/TX9QuO3WzcCJz1uaaSwQAz39Kb0.jpg",
        ]
        for im in normal_image_links:
            if im in bad_images:
                raise Exception("Bad images")
        # No images
        if not normal_image_links:
            raise Exception("No images")
        return normal_image_links

    async def save_images(
        self,
        links: list,
        output_dir: str,
        download_count: int,
        file_name: str = None,
    ) -> None:
        """
        Saves images to output directory
        """

        if self.debug_file:
            self.debug(download_message)
        if not self.quiet:
            print(download_message)
        with contextlib.suppress(FileExistsError):
            os.mkdir(output_dir)
        try:
            fn = f"{file_name}_" if file_name else ""
            jpeg_index = 0

            for link in links[:download_count]:
                while os.path.exists(
                    os.path.join(output_dir, f"{fn}{jpeg_index}.jpeg")
                ):
                    jpeg_index += 1
                response = await self.session.get(link)
                if response.status_code != 200:
                    raise Exception("Could not download image")
                # save response to file
                with open(
                    os.path.join(output_dir, f"{fn}{jpeg_index}.jpeg"), "wb"
                ) as output_file:
                    output_file.write(response.content)
                jpeg_index += 1
        except httpx.InvalidURL as url_exception:
            raise Exception(
                "Inappropriate contents found in the generated images. Please try again or try another prompt.",
            ) from url_exception


async def async_image_gen(
    prompt: str,
    download_count: int,
    output_dir: str,
    u_cookie=None,
    debug_file=None,
    quiet=False,
    all_cookies=None,
):
    async with ImageGenAsync(
        u_cookie,
        debug_file=debug_file,
        quiet=quiet,
        all_cookies=all_cookies,
    ) as image_generator:
        images = await image_generator.get_images(prompt)
        await image_generator.save_images(
            images, output_dir=output_dir, download_count=download_count
        )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-U", help="Auth cookie from browser", type=str)
    parser.add_argument("--cookie-file", help="File containing auth cookie", type=str)
    parser.add_argument(
        "--prompt",
        help="Prompt to generate images for",
        type=str,
        required=True,
    )

    parser.add_argument(
        "--output-dir",
        help="Output directory",
        type=str,
        default="./output",
    )

    parser.add_argument(
        "--download-count",
        help="Number of images to download, value must be less than five",
        type=int,
        default=4,
    )

    parser.add_argument(
        "--debug-file",
        help="Path to the file where debug information will be written.",
        type=str,
    )

    parser.add_argument(
        "--quiet",
        help="Disable pipeline messages",
        action="store_true",
    )
    parser.add_argument(
        "--asyncio",
        help="Run ImageGen using asyncio",
        action="store_true",
    )
    parser.add_argument(
        "--version",
        action="store_true",
        help="Print the version number",
    )

    args = parser.parse_args()

    if args.version:
        print(pkg_resources.get_distribution("BingImageCreator").version)
        sys.exit()

    # Load auth cookie
    cookie_json = None
    if args.cookie_file is not None:
        with contextlib.suppress(Exception):
            with open(args.cookie_file, encoding="utf-8") as file:
                cookie_json = json.load(file)

    if args.U is None and args.cookie_file is None:
        raise Exception("Could not find auth cookie")

    if args.download_count > 4:
        raise Exception("The number of downloads must be less than five")

    if not args.asyncio:
        # Create image generator
        image_generator = ImageGen(
            args.U,
            args.debug_file,
            args.quiet,
            all_cookies=cookie_json,
        )
        image_generator.save_images(
            image_generator.get_images(args.prompt),
            output_dir=args.output_dir,
            download_count=args.download_count,
        )
    else:
        asyncio.run(
            async_image_gen(
                args.prompt,
                args.download_count,
                args.output_dir,
                args.U,
                args.debug_file,
                args.quiet,
                all_cookies=cookie_json,
            ),
        )


if __name__ == "__main__":
    main()