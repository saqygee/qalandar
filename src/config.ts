interface OllamaConfig {
    ollamaURL:string,
    temperature:number,
    top_p:number,
    top_k:number,
    repeat_penalty:number,
    max_new_tokens:number,
    stream:boolean
}
export const ollamaConfig:OllamaConfig = {
    ollamaURL: "http://localhost:11434/api/generate",
    temperature:0.9,
    top_p:0.8,
    top_k:20,
    repeat_penalty:1.1,
    max_new_tokens:1024,
    stream:false
};