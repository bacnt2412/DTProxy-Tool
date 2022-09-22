<template>
  <div :style="`overflow: auto; height:${$vuetify.breakpoint.height - 30}px`">
    <div style="display: flex; align-items: center" class="my-4 ml-2">
      <span>Tìm kiếm: </span>
      <v-combobox
        v-model="findByStatus"
        :items="itemsFindByStatus"
        label="Trạng thái"
        class="ml-2"
        style="display: flex; max-width: 200px"
        outlined
        dense
        hide-details=""
      ></v-combobox>
      <v-btn color="success ml-2" @click="getListProxy" small
        ><v-icon small>{{ icons.mdiReload }}</v-icon
        ><span class="ml-1">Tải danh sách proxy</span></v-btn
      >
    </div>
    <h2 class="ml-2 mb-1" style="">Danh Sách Proxy</h2>
    <div class="mx-3 justify-end d-flex" style="flex-wrap: wrap">
      <v-btn small class="primary mb-2" @click="onClickCopyLicense">
        <v-icon size="14" class="mr-1">{{ icons.mdiContentCopy }}</v-icon> Copy
        Lincense</v-btn
      >
      <v-btn
        small
        class="ml-2 mb-2"
        color="pink"
        dark
        @click="onClickCopyHttps"
      >
        <v-icon size="14" class="mr-1">{{ icons.mdiContentCopy }}</v-icon> Copy
        HTTPS</v-btn
      >
      <v-btn
        small
        class="ml-2 mb-2"
        color="indigo"
        dark
        @click="onClickCopySocks5"
      >
        <v-icon size="14" class="mr-1">{{ icons.mdiContentCopy }}</v-icon> Copy
        Socks5</v-btn
      >
      <v-btn
        small
        class="ml-2 mb-2"
        dark
        color="teal"
        @click="onClickCopyLocal"
      >
        <v-icon size="14" class="mr-1">{{ icons.mdiContentCopy }}</v-icon> Copy
        Local</v-btn
      >
      <v-btn
        small
        class="ml-2 mb-2"
        dark
        color="purple"
        @click="onClickSetTimeChangeIP"
      >
        <v-icon size="14" class="mr-1">{{ icons.mdiTimerSyncOutline }}</v-icon>
        Thời Gian Đổi IP</v-btn
      >
    </div>
    <v-divider></v-divider>
    <div class="d-flex flex-row align-center font-weight-bold fs-12">
      <div class="d-flex align-center" style="flex: 0.1 0 100px">
        <v-checkbox
          class="reset py-3 pl-2"
          hide-details
          @click="onClickCheckALL"
          v-model="isCheckALL"
        ></v-checkbox>
        <span class="ml-2">STT</span>
      </div>
      <div style="flex: 1 0 100px" class="mr-2">Ghi chú</div>
      <div style="flex: 1 0 100px" class="mr-2">Api key</div>
      <div style="flex: 1 0 100px" class="mr-2">Ngày tạo/ Hết hạn</div>
      <div style="flex: 0.1 0 80px" class="mr-2">Status</div>
      <div style="flex: 1 0 280px" class="mr-2 text-center">IP</div>
      <div style="flex: 1 0 100px" class="text-center">Thao tác</div>
    </div>
    <v-divider></v-divider>

    <v-container class="pa-0 fs-12" fluid>
      <div v-for="item in listLicenseShow" :key="item.api_key">
        <proxy-item
          :item="item"
          @onUpdateLicense="onUpdateLicense"
          :publicIp="publicIp"
        >
        </proxy-item>
        <v-divider></v-divider>
      </div>
    </v-container>
    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate color="green"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import { ipcRenderer, shell, clipboard } from "electron";
import {
  mdiVolumeMedium,
  mdiFolderOpen,
  mdiContentCopy,
  mdiAutoFix,
  mdiMapMarkerRadius,
  mdiReload,
  mdiShieldAccount,
  mdiTimerSyncOutline,
} from "@mdi/js";
import ApiProxy from "../apiProxy";
import Constant from "../Constant";
import lodash from "lodash";
import axios from "axios";
import utils from "../utils";
const Store = require("electron-store");
const store = new Store();
import ProxyItem from "./ProxyItem.vue";
import ip from "ip";

export default {
  name: "Home",
  components: { ProxyItem },
  data() {
    return {
      icons: {
        mdiVolumeMedium,
        mdiFolderOpen,
        mdiContentCopy,
        mdiAutoFix,
        mdiMapMarkerRadius,
        mdiReload,
        mdiShieldAccount,
        mdiTimerSyncOutline,
      },
      isLoading: false,
      listLicense: [],
      publicIp: null,
      isCheckALL: false,
      findByStatus: {
        text: "Đang hoạt động",
        value: "ACTIVE",
      },
      itemsFindByStatus: [
        {
          text: "Tất cả",
          value: null,
        },
        {
          text: "Đang hoạt động",
          value: "ACTIVE",
        },
        {
          text: "Hết hạn",
          value: "EXPIRED",
        },
        {
          text: "Tạm dừng",
          value: "PAUSED",
        },
      ],
      ipLocal: null,
    };
  },
  computed: {
    listLicenseShow() {
      let result = this.listLicense.filter((item) => {
        if (this.findByStatus.value) {
          return item.status === this.findByStatus.value;
        }
        return true;
      });
      for (let i = 0; i < result.length; i++) {
        result[i].stt = i;
      }
      return result;
    },
  },
  async mounted() {
    this.ipLocal = ip.address();
    this.publicIp = await this.getPubicIp();
    await this.getListProxy();
    // this.startThreadChangeIP();
  },
  methods: {
    onClickCopyLicense() {
      let stringLicense = ``;
      this.listLicense.map((item) => {
        if (item.selected) {
          stringLicense += item.api_key + "\n";
        }
      });
      this.onCopy(stringLicense);
    },
    onClickCopyHttps() {
      let textCopy = ``;
      this.listLicense.map((item) => {
        if (item.selected && item.detail) {
          textCopy += item.detail.http_ipv4 + "\n";
        }
      });
      this.onCopy(textCopy);
    },
    onClickCopySocks5() {
      let textCopy = ``;
      this.listLicense.map((item) => {
        if (item.selected && item.detail) {
          textCopy += item.detail.socks_ipv4 + "\n";
        }
      });
      this.onCopy(textCopy);
    },
    onClickCopyLocal() {
      let textCopy = ``;
      this.listLicense.map((item) => {
        if (item.selected && item.detail) {
          textCopy += item.proxyLocal + "\n";
        }
      });
      this.onCopy(textCopy);
    },
    async onClickSetTimeChangeIP() {
      var result = await this.$swal.fire({
        title: "Thời gian đổi IP",
        showCancelButton: true,
        confirmButtonText: "Lưu",
        cancelButtonText: "Hủy",
        showLoaderOnConfirm: true,
        focusConfirm: true,
        customClass: {
          container: "position-absolute",
        },
        html: `<input type="number" value="0" placeholder="Nhập thời gian" id="swal-input1" class="swal2-input"> (giây)`,
        preConfirm: () => {
          return parseInt(document.getElementById("swal-input1").value);
        },
      });
      if (result.isConfirmed) {
        let timeAutoChangeIP = result.value ? result.value : 0;
        for (let i = 0; i < this.listLicense.length; i++) {
          if (this.listLicense[i].selected) {
            this.listLicense[i].timeAutoChangeIP = timeAutoChangeIP;
          }
        }
        this.$emit("onUpdateLicense", { ...this.item, timeAutoChangeIP });
      }
    },

    onClickCheckALL() {
      let result = this.listLicense.filter((item) => {
        if (this.findByStatus.value) {
          return item.status === this.findByStatus.value;
        }
        return true;
      });
      for (let i = 0; i < result.length; i++) {
        result[i] = { ...result[i], selected: this.isCheckALL };
      }
      this.listLicense = [...result];
    },
    onUpdateLicense(license) {
      this.listLicense = this.listLicense.map((item) => {
        if (item.api_key === license.api_key) {
          return { ...item, ...license };
        }
        return item;
      });
    },
    async getPubicIp() {
      let res = await axios.get("http://lumtest.com/myip.json", {
        timeout: 10 * 1000,
      });
      if (res && res.status === 200) {
        return res.data.ip;
      }
      return null;
    },
    async onCopy(text) {
      clipboard.writeText(text.trim(), "selection");
      this.$swal.fire({
        icon: "success",
        title: "Đã Copy",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        target: "#custom-target",
        timer: 1000,
      });
    },
    async getListProxy() {
      let tokenApi = store.get("tokenApi") || "";
      if (!tokenApi) {
        return;
      }
      this.isLoading = true;
      let result = await ApiProxy.getListProxy(tokenApi);
      this.isLoading = false;
      let currentPortLocal = 6800;

      if (result.status === Constant.STATUS.SUCCESS) {
        let vue = this;
        this.listLicense = lodash
          .orderBy(result.data, "start_time_2")
          .map((item, index) => {
            currentPortLocal++;
            let timeString =
              item.start_time.split(" ")[0] +
              " " +
              item.start_time.split(" ")[1].split("-")[1] +
              "-" +
              item.start_time.split(" ")[1].split("-")[0] +
              "-" +
              item.start_time.split(" ")[1].split("-")[2];
            return {
              ...item,
              stt: index,
              start_time_2: new Date(timeString),
              portLocal: currentPortLocal,
              proxyLocal: vue.ipLocal + ":" + currentPortLocal,
            };
          });
        for (let i = 0; i < this.listLicense.length; i++) {
          const license = this.listLicense[i];
          if (license.status !== "EXPIRED") {
            let resultDetail = await ApiProxy.getCurrentProxyByLicense(
              license.api_key,
              this.publicIp
            );
            let detail =
              resultDetail.status === Constant.STATUS.SUCCESS
                ? resultDetail.data
                : null;
            let k = i;
            ipcRenderer.send(
              "create-server-proxy",
              {
                proxyUpstream: "http://" + resultDetail.data.http_ipv4,
                portLocal: license.portLocal,
              } //+ resultDetail.data.authentication.username + ":" + resultDetail.data.authentication.password
            );
            detail = {
              ...detail,
            };
            this.listLicense[k] = { ...this.listLicense[k], detail };
            this.listLicense = [...this.listLicense];
          }
        }
      } else {
        this.$swal.fire({
          icon: "error",
          title: "Lỗi lấy danh sách proxy",
          text: result.data.msg,
        });
      }
    },

    // async startThreadChangeIP() {
    //   setInterval(() => {
    //     console.log(" ########### setInterval ########### ", this.listLicense);

    //     for (let i = 0; i < this.listLicense.length; i++) {
    //       let license = this.listLicense[i];
    //       if (license.status !== "EXPIRED" && license.timeAutoChangeIP > 0) {
    //         console.log(
    //           " #### license.timeChangeIpLeft: ",
    //           license.timeChangeIpLeft
    //         );
    //         if (!license.timeChangeIpLeft || license.timeChangeIpLeft > license.timeAutoChangeIP) {
    //           license.timeChangeIpLeft = license.timeAutoChangeIP;
    //           //Change IP
    //           console.log(
    //             " ======================================================== "
    //           );
    //           //==========
    //         } else {
    //           license.timeChangeIpLeft = license.timeChangeIpLeft - 1;
    //         }
    //         this.listLicense[i] = Object.assign({}, license);
    //       }
    //     }
    //     this.listLicense = [...this.listLicense];
    //   }, 1000);
    // },
  },
};
</script>

<style scoped></style>
