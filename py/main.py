import argparse
import os
import random

import pendulum
import requests
from BingImageCreator import ImageGen

GET_UP_MESSAGE_TEMPLATE = "今天是 {current_day}.\r\n\r\n 起床啦，喝杯咖啡，背个单词，去跑步。\r\n\r\n 今天的一句诗:\r\n {sentence} \r\n"
SENTENCE_API = "https://v1.jinrishici.com/all"
DEFAULT_SENTENCE = "赏花归去马如飞\r\n去马如飞酒力微\r\n酒力微醒时已暮\r\n醒时已暮赏花归\r\n"
TIMEZONE = "Asia/Shanghai"


def get_one_sentence():
    try:
        r = requests.get(SENTENCE_API)
        if r.ok:
            concent = r.json().get("content")
            return concent
        return DEFAULT_SENTENCE
    except:
        print("get SENTENCE_API wrong")
        return DEFAULT_SENTENCE


def make_pic_and_save(sentence, bing_cookie):
    # for bing image when dall-e3 open drop this function
    print(f"First: {bing_cookie}")
    i = ImageGen(bing_cookie)
    print(f"ImageGen Result: {i}")
    images = i.get_images(sentence)
    # date_str = pendulum.now().to_date_string()
    # new_path = os.path.join("OUT_DIR", date_str)
    # if not os.path.exists(new_path):
    #     os.mkdir(new_path)
    # i.save_images(images, new_path)
    # index = random.randint(0, len(images) - 1)
    # image_url_for_issue = f"https://github.com/yihong0618/2023/blob/main/OUT_DIR/{date_str}/{index}.jpeg?raw=true"
    return images


def make_get_up_message(bing_cookie):
    sentence = get_one_sentence()
    now = pendulum.now(TIMEZONE)
    current_day = now.to_date_string()
    link_list = []
    try:
        link_list = make_pic_and_save(sentence, bing_cookie)
    except Exception as e:
        print("make_pic_and_save wrong")
        print(str(e))
        # give it a second chance
        try:
            sentence = get_one_sentence()
            print(f"Second: {sentence}")
            link_list = make_pic_and_save(sentence, bing_cookie)
        except Exception as e:
            print(str(e))
    body = GET_UP_MESSAGE_TEMPLATE.format(current_day=current_day, sentence=sentence)
    return body, link_list


def main(
    bing_cookie,
):
    body, link_list = make_get_up_message(
        bing_cookie
    )
    print(body, link_list)



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("bing_cookie", help="bing cookie")
    options = parser.parse_args()
    main(
        options.bing_cookie,
    )