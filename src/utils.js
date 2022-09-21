import Fs from 'fs';
import Path from 'path';
import FS from 'fs';
import Axios from 'axios';

const generateNumberString = (numberC) => {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < numberC; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const checkAndCreateFolderIfNotExist = (path) => {
    try {
        if (!path) {
            return;
        }
        while (path.includes('\\')) {
            path = path.replace('\\', '/');
        }
        while (path.includes('\\\\')) {
            path = path.replace('\\\\', '/');
        }
        while (path.includes('//')) {
            path = path.replace('//', '/');
        }
        if (Path.basename(path)) {
            path = path.replace(Path.basename(path), '');
        }
        let pathCurrent = '';
        let arrs = [];
        if (path.split('/').length > 1) {
            arrs = [...arrs, ...path.split('/')];
        }
        for (let i = 0; i < arrs.length - 1; i++) {
            let name = arrs[i];
            if (!name) {
                break;
            }
            if (pathCurrent) {
                pathCurrent += '/' + name;
            } else {
                pathCurrent = name;
            }
            if (!Fs.existsSync(pathCurrent)) {
                Fs.mkdirSync(pathCurrent);
            }
        }
    } catch (error) {
        console.log(' ##### checkAndCreateFolderIfNotExist Error: ', error);
    }
};

const getExtbyFile = (file) => {
    let mime = getMimeTypeFile(file);
    let ext = getExtbyMime(mime);
    return ext;
};
const sleep = (time) => {
    return new Promise((resolve, reject) => {
        try {
            setTimeout(resolve, time);
        } catch (error) {
            console.log(error);
            reject(error);
        }
    });
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const removeAllTag = (text) => {
    var regex = /(<([^>]+)>)/gi;
    let result = text.replace(regex, '');
    return result;
};

const isUrlEndcoded = (url) => {
    return url.includes('%');
};

const downloadFileWithAxios = async (url, saveFile) => {
    while (url.includes('\\')) {
        url = url.replace('\\', '/');
    }
    if (!isUrlEndcoded(url)) {
        url = encodeURI(url);
    }
    if (global.IS_SHOW_CMD_FFMPEG) {
        console.log(' === START DOWNLOAD url: ', url);
        console.log(' === START DOWNLOAD saveFile: ', saveFile);
    }
    try {
        let result = false;
        try {
            const writer = Fs.createWriteStream(saveFile);
            const response = await Axios.get(url, {
                responseType: 'stream',
            });
            response.data.pipe(writer);
            result = await new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    writer.end();
                    resolve(true);
                });
                writer.on('error', () => {
                    writer.end();
                    reject(false);
                });
            });
        } catch (error) {
            console.log(error);
        }
        return result;
    } catch (error) {
        if (global.IS_SHOW_CMD_FFMPEG) {
            console.log(' ############ Error downloadFile: ', error.message);
        }
    }
};

const downloadFile = async (url, saveFile, onProgress, idVideo) => {
    while (url.includes('\\')) {
        url = url.replace('\\', '/');
    }
    if (!isUrlEndcoded(url)) {
        url = encodeURI(url);
    }

    console.log(' === START DOWNLOAD: ', url);
    console.log(' === START DOWNLOAD: ', saveFile);

    try {
        let result = false;
        const writer = Fs.createWriteStream(saveFile);
        const response = await Axios.get(url, {
            responseType: 'stream',
        });
        response.data.pipe(writer);
        result = await new Promise((resolve, reject) => {
            writer.on('finish', () => {
                writer.end();
                resolve(true);
            });
            writer.on('error', () => {
                writer.end();
                reject(false);
            });
        });

        if (result) {
            if (global.IS_SHOW_CMD_FFMPEG) {
                console.log(' =========  FINISH DOWNLOAD  =========');
            }
        }
        return result;
    } catch (error) {
        if (global.IS_SHOW_CMD_FFMPEG) {
            console.log(' ############ Error downloadFile: ', error.message);
        }
    }
};

const User = (idUser) => {
    idUser = idUser.toString();
    let folderUserData = Path.join(global.FOLDER_USER_DATA, idUser);
    let folderUserTemp = Path.join(global.FOLDER_USER_TEMP, idUser);
    const createFolder = () => {
        try {
            let avatar = Path.join(folderUserData, 'avatar');
            let data = Path.join(folderUserData, 'data');
            let layout = Path.join(folderUserData, 'layout');
            let temp = Path.join(folderUserTemp, 'video-temp');

            if (!FS.existsSync(folderUserData)) {
                FS.mkdirSync(folderUserData);
            }
            if (!FS.existsSync(folderUserTemp)) {
                FS.mkdirSync(folderUserTemp);
            }
            if (!FS.existsSync(folderUserData)) {
                FS.mkdirSync(folderUserData);
            }
            if (!FS.existsSync(avatar)) {
                FS.mkdirSync(avatar);
            }
            if (!FS.existsSync(temp)) {
                FS.mkdirSync(temp);
            }
            if (!FS.existsSync(data)) {
                FS.mkdirSync(data);
            }
            if (!FS.existsSync(layout)) {
                FS.mkdirSync(layout);
            }
        } catch (error) {
            console.log(' ### createFolder', error);
            throw new Error(' ### createFolder: ' + error);
        }
        return null;
    };
    createFolder();
    return {
        createFolder: createFolder,
        avatarFolder: Path.join(folderUserData, 'avatar').replace(/\\/g, '/'),
        tempFolder: Path.join(folderUserTemp, 'video-temp').replace(/\\/g, '/'),
        dataFolder: Path.join(folderUserData, 'data').replace(/\\/g, '/'),
        layoutFolder: Path.join(folderUserData, 'layout').replace(/\\/g, '/'),
        folderUserData,
        folderUserTemp,
    };
};

var deleteFolder = function (path) {
    if (FS.existsSync(path)) {
        FS.readdirSync(path).forEach(function (file, index) {
            var curPath = path + '/' + file;
            if (FS.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolder(curPath);
            } else {
                // delete file
                FS.unlinkSync(curPath);
            }
        });
        FS.rmdirSync(path);
    } else {
        console.log(' not exist', path);
    }
};

const converTimeToSecound = (time) => {
    try {
        let times = time.split(':');
        let totalTime = parseInt(times[0]) * 3600 + parseInt(times[1]) * 60;
        if (times[2].includes('.')) {
            totalTime += parseInt(times[2].split('.')[0]) + parseInt(times[2].split('.')[1]) / Math.pow(10, times[2].split('.')[1].length);
        } else if (times[2].includes(',')) {
            totalTime += parseInt(times[2].split(',')[0]) + parseInt(times[2].split(',')[1]) / Math.pow(10, times[2].split(',')[1].length);
        } else {
            totalTime += parseInt(times[2]);
        }
        return totalTime;
    } catch (error) {
        return 0;
    }
};

const generateKey = (number = 20) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < number; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const secondsToHHMMSS = (sec) => {
    var hours = Math.floor(sec / 3600);
    hours >= 1 ? (sec = sec - hours * 3600) : (hours = '00');
    var min = Math.floor(sec / 60);
    min >= 1 ? (sec = sec - min * 60) : (min = '00');
    // sec < 1 ? (sec = '00') : void 0;
    min.toString().length == 1 ? (min = '0' + min) : void 0;
    sec = sec.toFixed(2);

    sec.toString().length == 1 ? (sec = '0' + sec) : void 0;

    if (sec > 0 && sec < 10) {
        sec = '0' + sec;
    }

    let time = hours + ':' + min + ':' + sec;
    return time;
};

const secondsToTimeSubSRT = (sec) => {
    var hours = Math.floor(sec / 3600);
    hours >= 1 ? (sec = sec - hours * 3600) : (hours = '00');
    var min = Math.floor(sec / 60);
    min >= 1 ? (sec = sec - min * 60) : (min = '00');
    // sec < 1 ? (sec = '00') : void 0;
    min.toString().length == 1 ? (min = '0' + min) : void 0;
    sec = sec.toFixed(3).replace('.', ',');

    sec.toString().length == 1 ? (sec = '0' + sec) : void 0;

    if (sec > 0 && sec < 10) {
        sec = '0' + sec;
    }
    let time = hours + ':' + min + ':' + sec;
    return time;
};

const secondsToHms = (sec) => {
    var hours = Math.floor(sec / 3600);
    hours >= 1 ? (sec = sec - hours * 3600) : (hours = '00');
    var min = Math.floor(sec / 60);
    min >= 1 ? (sec = sec - min * 60) : (min = '00');
    // sec < 1 ? (sec = '00') : void 0;
    min.toString().length == 1 ? (min = '0' + min) : void 0;
    sec = sec.toFixed(3);

    sec.toString().length == 1 ? (sec = '0' + sec) : void 0;

    if (sec > 0 && sec < 10) {
        sec = '0' + sec;
    }
    let time = hours + ':' + min + ':' + sec;
    return time;
};

const secondsToTime = (sec) => {
    var hours = Math.floor(sec / 3600);
    hours >= 1 ? (sec = sec - hours * 3600) : (hours = '');
    var min = Math.floor(sec / 60);
    min >= 1 ? (sec = sec - min * 60) : (min = '');
    // sec < 1 ? (sec = '00') : void 0;
    min.toString().length == 1 ? (min = '0' + min) : void 0;
    sec = sec.toFixed(0);

    sec.toString().length == 1 ? (sec = '0' + sec) : void 0;

    if (sec > 0 && sec < 10) {
        sec = '0' + sec;
    }
    hours = hours !== '' ? hours + ':' : '00:';
    min = min !== '' ? min + ':' : '00:';

    let time = hours + min + sec;
    return time;
};

const deleteFolderRecursive = async function (path) {
    if (Fs.existsSync(path)) {
        let listFile = Fs.readdirSync(path);
        for (let i = 0; i < listFile.length; i++) {
            let file = listFile[i];
            const curPath = Path.join(path, file);

            if (Fs.lstatSync(curPath).isDirectory()) {
                // recurse
                await deleteFolderRecursive(curPath);
            } else {
                // delete file
                Fs.unlinkSync(curPath);
                await sleep(100);
            }
        }
        Fs.rmdirSync(path);
        await sleep(100);
    }
};

const partFileName = (filename) => {
    if (!filename) {
        return null;
    }
    if (filename.length > 200) {
        filename = filename.substring(0, 200);
    }
    return filename + '-' + generateKey();
};

const formatUrlSpace = (url) => {
    if (url && !url.includes('https')) {
        url = 'https://' + url;
    }
    return url;
};
const Utils = {
    getExtbyFile,
    secondsToTimeSubSRT,
    secondsToHms,
    secondsToTime,
    formatUrlSpace,
    downloadFile,
    User,
    converTimeToSecound,
    deleteFolder,
    sleep,
    generateKey,
    secondsToHHMMSS,
    removeAllTag,
    deleteFolderRecursive,
    isUrlEndcoded,
    partFileName,
    getRandomInt,
    checkAndCreateFolderIfNotExist,
    generateNumberString,
    downloadFileWithAxios,
};

export default Utils;
