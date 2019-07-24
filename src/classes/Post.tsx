import { TimeStamp } from "./TimeStamp";

export interface IPost {
    id: string
    title: string
    media: IMedia[]
    commentCount: number
    author: string
    details: string
    posted: TimeStamp
}
export interface IMedia {
    filename: string
    url: string
}

export class Media implements IMedia {
    constructor(filename: string, url: string) {
        this.filename = filename
        this.url = url
    }
    filename = ""
    url = ""
}

export class Post implements IPost {
    constructor(title: string, media: IMedia[], commentCount: number, author: string, posted: TimeStamp, details: string) {
        this.title = title
        this.media = media
        this.commentCount = commentCount
        this.author = author
        this.posted = posted
        this.details = details
    }
    id = ""
    title = ""
    media = [new Media("", "")]
    commentCount = 0
    author = ""
    posted = new TimeStamp()
    details = ""
}
