const { isDate } = require("util/types");

export default function(eleventyConfig) {
//module.exports = function(eleventyConfig) {
    // Shortcodes added in this way are available in:
    // * Markdown
    // * Liquid
    // * Nunjucks
    // * Handlebars (not async)
    // * JavaScript
    
    eleventyConfig.setTemplateFormats([
		"md",
        "html",
        "njk",
		"css",
        "png",
        "jpg",
        "jpeg",
        "gif",
        "svg",
	]);

    eleventyConfig.addExtension("md", ObsidianConverterExtension);
};


const ObsidianConverterExtension = {
    compile: function (inputContent, inputPath) {
        //let html = marked.parse(inputContent);

        return async function (data) {
            
            //console.debug('ObsidianConverterExtension', data);

            data = TreatFrontmatterTimesAsLocal(data);
            
            let content = await this.defaultRenderer(data);

            const post_processors = [
                ObsidianEmbededInternalImages,
                //ObsidianExternalImages
                ImageWithAltSize
            ]

            post_processors.forEach(p => {
                content = p(content);
            });

            return content;
        };
    },
}

const TreatFrontmatterTimesAsLocal = function (data) {
    // convert any frontmatter date times without a timezone to local timezone
    //console.debug('LocalTimezoneFrontmatterDates', {data});

    Object.entries(data).forEach(([key, value]) => {
        if ( isDate(value) ){
            const tzdiff = value.getTimezoneOffset();
            const newDate = new Date(value.getTime() + tzdiff*60000);
            //console.debug('LocalTimezoneFrontmatterDates', {key, value, tzdiff, newDate});
            data[key] = newDate;
        }
    })

    return data;
}

const ObsidianEmbededInternalImages = function (content) {

    const supportedExts = ['png', 'jpg', 'jpeg', 'gif', 'svg'];

    const rx = /\!\[\[(.*?)\s*(\|(.*))?\s*\]\]/gi;
    const rxSize = /(\d+)\s*(x\s*(\d+))?/gi;

    return String(content).replace( rx , (match, src, _, size) => {

        // check for image extension
        const extCheck = String(src).toLowerCase();
        if ( supportedExts.findIndex( (ext) => extCheck.endsWith(ext) ) < 0 ){
            return match;
        }

        // build model
        const imgM = {
            src: src,
        }
        
        if (size){
            const matchSize = Array.from( String(size).matchAll(rxSize) );
            const w = parseFloat( matchSize.at(0).at(1) );
            if (w){
                imgM.width = w;
            }
            const h = parseFloat( matchSize.at(0).at(3) );
            if (h){
                imgM.height = h;
            }
        }

        // render the image
        return `<img src="${src}"${imgM.width?' width="'.concat(imgM.width,'"'):''}${imgM.height?' height="'.concat(imgM.height, '"'):''}>`;

    })

}

//<img.*?alt=["'](.*?)\s*\|\s*(\d+)(x(\d+))?["']\s*>

const ImageWithAltSize = function (content) {

    const rx = /<img.*?(alt=["'](.*?)\s*\|\s*(\d+)(x(\d+))?["'])\s*>/gi;

    return String(content).replace( rx , (match, alt, finalAlt, width, _, height) => {
        //e.g. ![Engelbart|100x145](https://history-computer.com/ModernComputer/Basis/images/Engelbart.jpg)
        //console.debug({ match, alt, finalAlt, width, height});
        return match.replace( alt, `alt="${finalAlt}"${width?' width="'.concat(width,'"'):''}${height?' height="'.concat(height, '"'):''}`);
    })

}

// const ObsidianExternalImages = function (content) {

//     const supportedExts = ['png', 'jpg', 'jpeg', 'gif', 'svg'];

//     const rx = /\!\[(.*?)(\|(\d+)(x(\d+))?)?\]\((.*?)\)/gi;
//     const rxSize = /(\d+)\s*(x\s*(\d+))?/gi;

//     return String(content).replace( rx , (match, alt, _2, widht, _4, height, src) => {
//         //e.g. ![Engelbart|100x145](https://history-computer.com/ModernComputer/Basis/images/Engelbart.jpg)

//         console.debug({ match, alt, widht, height, src});
        
//         return match;

//         // check for image extension
//         const extCheck = String(src).toLowerCase();
//         if ( supportedExts.findIndex( (ext) => extCheck.endsWith(ext) ) < 0 ){
//             return match;
//         }

//         // build model
//         const imgM = {
//             src: src,
//         }
        
//         if (size){
//             const matchSize = Array.from( String(size).matchAll(rxSize) );
//             const w = parseFloat( matchSize.at(0).at(1) );
//             if (w){
//                 imgM.width = w;
//             }
//             const h = parseFloat( matchSize.at(0).at(3) );
//             if (h){
//                 imgM.height = h;
//             }
//         }

//         // render the image
//         return `<img src="${src}"${imgM.width?' width="'.concat(imgM.width,'"'):''}${imgM.height?' height="'.concat(imgM.height, '"'):''}>`;

//     })

// }