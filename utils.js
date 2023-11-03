/**
 * @typedef { "lucide"|"google"|"bootstrap"|"fontawesome" } Providers
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
        const provider = (
            url.includes("gstatic.com") ? "google" : url.includes("getbootstrap.com") ? "bootstrap" :
            url.includes("fontawesome.com") ? "fontawesome" : url.includes("lucide-icons") ? "lucide" : ""
        )
        const request = await fetch(url)
        // return empty string
        if(request.status!==200) return ""
        // Clean svg
        let svgText = (await request.text()).trim()
        svgText = svgText.replace(/ (height|width)="[^"]+"/g, ` $1="100%"`).replace(/(class)="[^"]+"/g, '').replace(/ >/g,">").replace(/<!--[\s\S]*?-->/ig,'')
                  .replace(/\n/g,"").replace(/\s+/g, ' ').replace(/ <path/ig,'<path')
        // if svg does not contains height or with, add it
        if(!svgText.includes('width="')) svgText = svgText.replace('>',' height="100%" width="100%">')
        // if svg does not fill, add it
        if(!svgText.includes('fill=')) svgText = svgText.replace('>',' fill="currentColor">')
        // format google svg
        const spaces = {
            one:framework==="react" ? "            " : "    ",
            two:framework==="react" ? "        " : "",
        }
        svgText = svgText.replace(/<path/ig,`\n${spaces.one}<path`).replace('</svg>',`\n${spaces.two}</svg>`)
        return svgText
    }

    /** Get svg provider url to be use
     * @param {string} urlName - url icon name
     * @param {Providers} provider svg provider @private */
    GET_SVG_PROVIDER_URL(urlName,provider){
        if(provider==="google") return `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${urlName}/default/24px.svg`
        else if(provider==="lucide") return `https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/${urlName}.svg`
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
        // for lucide icons, set stroke as color
        if(svgText.includes('stroke="currentColor"') && framework!=="svg") svgText = svgText.replace('stroke="currentColor"','stroke={color}')
        else if(!svgText.includes('stroke="currentColor"') && framework!=="svg") svgText = svgText.replace('fill="currentColor"','fill={color}')

        if(framework==="react"){
            svgText = svgText.replace('width="100%"','width={size?size:"100%"}').replace('height="100%"','height={size?size:"100%"}')
            result['code'] = `export default function({size,color}:{size?:string,color?:string}){\n    return(\n        ${svgText}\n    )\n}`
            result['fileExt'] = ".tsx"
        }
        else if(framework==="svelte"){
            svgText = svgText.replace('width="100%"','width={size}').replace('height="100%"','height={size}')
            result['code'] = `<script lang="ts">\n    export let size:string|undefined = "100%"\n    export let color:string|undefined = "currentColor"\n</script>\n${svgText}`
            result['fileExt'] = ".svelte"
        }
        else{
            result['code'] = svgText
            result['fileExt'] = ".svg"
        }
        return result
    }
}