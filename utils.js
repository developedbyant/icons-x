/**
 * @typedef { "google"|"bootstrap"|"fontawesome" } Providers
 * @typedef { "react"|"svelte"|"svg" } Frameworks */
export default new class utils {

    /** Make icon name for component @param {string|any} name */
    componentIconName(name){
        name = name.trim().replace(/ /g,"")
        return name.charAt(0).toUpperCase()+name.slice(1)
    }

    /** Convert text to icon url @param {string|any} name  */
    iconUrlName(name){
        name = name.trim().toLowerCase().replace(/ /g,"-")
        return name
    }

    /** Get clean svg code from svg url
     * @param {string} url
     * @param {Frameworks} framework @private */
    async GET_SVG(url,framework){
        const provider = url.includes("gstatic.com") ? "google" : url.includes("getbootstrap.com") ? "bootstrap" : url.includes("fontawesome.com") ? "fontawesome" : ""
        const request = await fetch(url)
        // return empty string
        if(request.status!==200) return ""
        // Clean svg
        let svgText = (await request.text()).trim()
        svgText = svgText.replace(/(height|width)="[^"]+"/g, `$1="100%"`).replace(/(class|fill)="[^"]+"/g, '').replace(/ >/g,">").replace(/<!--[\s\S]*?-->/ig,'')
        // if svg does not contains height or with, add it
        if(!svgText.includes('width="')) svgText = svgText.replace('>',' height="100%" width="100%">')
        // format google svg
        const spaces = {
            one:framework==="react" ? "            " : "    ",
            two:framework==="react" ? "        " : "",
        }
        if(provider==="google"||provider==="fontawesome") svgText = svgText.replace('">',`">\n${spaces.one}`).replace('</svg>',`\n${spaces.two}</svg>`)
        else if(provider==="bootstrap") svgText = svgText.replace('<path',`${spaces.one}<path`).replace('</svg>',`${spaces.two}</svg>`)
        return svgText
    }

    /** Get svg provider url to be use
     * @param {string} urlName - url icon name
     * @param {Providers} provider svg provider @private */
    GET_SVG_PROVIDER_URL(urlName,provider){
        if(provider==="google") return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${urlName}/default/24px.svg`
        else if(provider==="bootstrap") return `https://icons.getbootstrap.com/assets/icons/${urlName}.svg`
        else if(provider==="fontawesome") return `https://site-assets.fontawesome.com/releases/v6.1.1/svgs/solid/${urlName}.svg`
        else return `https://icons.getbootstrap.com/assets/icons/${urlName}.svg`
    }

    /** Get svg code from icon provider url
     * @param {Providers} provider svg provider
     * @param {string} urlName - url icon name
     * @param {Frameworks} framework */
    async svg(provider,urlName,framework){
        const url = this.GET_SVG_PROVIDER_URL(urlName,provider)
        return this.GET_SVG(url,framework)
    }

    /** Covert svg code to a framework component
     * @param {string} svgText
     * @param {Frameworks} framework */
    component(svgText,framework){
        const result = { code:"",fileExt:"" }
        if(framework==="react"){
            result['code'] = `export default function(){\n    return(\n        ${svgText}\n    )\n}`
            result['fileExt'] = ".tsx"
        }
        else if(framework==="svelte"){
            result['code'] = svgText
            result['fileExt'] = ".svelte"
        }
        else{
            result['code'] = svgText
            result['fileExt'] = ".svg"
        }
        return result
    }
}