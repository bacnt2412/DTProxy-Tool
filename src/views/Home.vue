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

    <h2 class="ml-2 mb-2" style="">Danh Sách Proxy</h2>
    <v-divider></v-divider>
    <div
      class="d-flex flex-row align-center font-weight-bold"
      style="font-size: 12px"
    >
      <div class="d-flex align-center" style="flex: 0.1 0 100px">
        <v-checkbox class="reset py-3 pl-2" hide-details></v-checkbox>
        <span class="ml-2">STT</span>
      </div>
      <div style="flex: 1 0 100px" class="mr-2">Ghi chú</div>
      <div style="flex: 1 0 100px" class="mr-2">Api key</div>
      <div style="flex: 1 0 100px" class="mr-2">Ngày tạo/ Hết hạn</div>
      <div style="flex: 1 0 100px" class="mr-2">Status</div>
      <div style="flex: 1 0 100px" class="mr-2">IP</div>
      <div style="flex: 1 0 100px" class="text-center">Thao tác</div>
    </div>
    <v-divider></v-divider>

    <v-container class="pa-0" fluid style="font-size: 14px">
      <div v-for="item in listLicense" :key="item.api_key">
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
} from "@mdi/js";
import ApiProxy from "../apiProxy";
import Constant from "../Constant";
import lodash from "lodash";
import axios from "axios";
const Store = require("electron-store");
const store = new Store();
import ProxyItem from "./ProxyItem.vue";

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
      },
      isLoading: false,
      listLicense: [],
      publicIp: null,
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
      headers: [
        {
          text: "STT",
          align: "start",
          sortable: false,
          value: "stt",
        },
        { text: "Note", value: "note" },
        { text: "Gói/License", value: "api_key" },
        { text: "Ngày bắt đầu/ hết hạn", value: "dateCreate" },
        { text: "Trạng thái", value: "_status" },
        { text: "Chi tiết", value: "details" },
        { text: "Thao tác", value: "actions" },
      ],
    };
  },
  computed: {
    listLicenseShow() {
      console.log(" =========== listLicenseShow ========== ");
      let result = this.listLicense.filter((item) => {
        if (this.findByStatus.value) {
          return item.status === this.findByStatus.value;
        }
        return true;
      });
      result = result.map((item, index) => {
        return {
          stt: index,
          ...item,
        };
      });
      return result;
    },
  },
  async mounted() {
    this.publicIp = await this.getPubicIp();
    await this.getListProxy();
  },
  methods: {
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
      clipboard.writeText(text, "selection");
      this.$swal.fire({
        icon: "success",
        title: "Đã Copy",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
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
      let ipLocal = ipcRenderer.sendSync("get-private-ip");
      if (result.status === Constant.STATUS.SUCCESS) {
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
              proxyLocal: ipLocal + ":" + currentPortLocal,
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
  },
};
</script>

<style scoped></style>
