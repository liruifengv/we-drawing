export type SentenceResponse = {
    content: string;
    origin: string;
    author: string;
    category: string;
};

export type Response = {
    images: string[];
} & SentenceResponse;
