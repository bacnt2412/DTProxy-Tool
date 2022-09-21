import Axios from 'axios';
import Constant from './Constant';

export default class ApiProxy {
    static async getListProxy(token) {
        try {
            let url = `https://app.dtproxy.vn/txproxy/v1/api/user/get-list-proxy?token=${token}`;
            let res = await Axios.get(url);
            if (res.data.code === 1) {
                return {
                    status: Constant.STATUS.SUCCESS,
                    data: res.data.data
                };
            }
            return {
                status: Constant.STATUS.ERROR,
                data: res.data
            };
        } catch (error) {
            return {
                status: Constant.STATUS.ERROR,
                data: error
            };
        }
    }

    static async getCurrentProxyByLicense(license, publicIp) {
        try {
            let url = `https://app.dtproxy.vn/txproxy/v1/api/proxy/get-current-proxy?license=${license}&authen_ips=${publicIp}`;
            let res = await Axios.get(url);
            if (res.data.code === 1) {
                return {
                    status: Constant.STATUS.SUCCESS,
                    data: res.data.data
                };
            }
            return {
                status: Constant.STATUS.ERROR,
                data: res.data
            };
        } catch (error) {
            return {
                status: Constant.STATUS.ERROR,
                data: error
            };
        }
    }

    static async getNewProxy(license, publicIp) {
        try {
            let url = `https://app.dtproxy.vn/txproxy/v1/api/proxy/get-new-proxy?license=${license}&authen_ips=${publicIp}`;
            let res = await Axios.get(url);
            if (res.data.code === 1) {
                return {
                    status: Constant.STATUS.SUCCESS,
                    data: res.data.data
                };
            }
            return {
                status: Constant.STATUS.ERROR,
                data: res.data
            };
        } catch (error) {
            return {
                status: Constant.STATUS.ERROR,
                data: error
            };
        }
    }
    static async getLocations(tokenApi) {
        try {
            let url = `https://app.dtproxy.vn/txproxy/v1/api/user/get-list-location?token=${tokenApi}`;
            let res = await Axios.get(url);
            if (res.data.code === 1) {
                return {
                    status: Constant.STATUS.SUCCESS,
                    data: res.data.data
                };
            }
            return {
                status: Constant.STATUS.ERROR,
                data: res.data
            };
        } catch (error) {
            return {
                status: Constant.STATUS.ERROR,
                data: error
            };
        }
    }

    static async changeLocation(license, locationId) {
        try {
            let url = `https://app.dtproxy.vn/txproxy/v1/api/proxy/get-new-location?license=${license}&authen_ips=${publicIp}&location=3${locationId}`;
            let res = await Axios.get(url);
            if (res.data.code === 1) {
                return {
                    status: Constant.STATUS.SUCCESS,
                    data: res.data.data
                };
            }
            return {
                status: Constant.STATUS.ERROR,
                data: res.data
            };
        } catch (error) {
            return {
                status: Constant.STATUS.ERROR,
                data: error
            };
        }
    }

}