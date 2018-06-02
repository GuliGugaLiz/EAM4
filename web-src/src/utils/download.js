import {getToken} from './authority';

export default function download(url, onsuccess){  
    document.getElementById("ifrdownload").setAttribute("src", url); 
}