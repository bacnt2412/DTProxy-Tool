<template>
  <div class="d-flex py-2" style="position: relative">
    <div class="d-flex align-center" style="flex: 0.1 0 100px">
      <v-checkbox
        class="reset pl-2"
        hide-details=""
        v-model="item.selected"
      ></v-checkbox>
      <span class="ml-2"> {{ item.stt + 1 }}</span>
    </div>
    <div style="flex: 1 0 100px" class="mr-2">
      <span>
        {{ item.note }}
        {{ new Date() }}
      </span>
    </div>
    <div style="flex: 1 0 100px" class="mr-2">
      <div class="api-key" @click="onCopy(item.api_key)">
        <span>{{ item.api_key }}</span>
      </div>
    </div>
    <div style="flex: 1 0 100px" class="mr-2">
      <div>{{ item.start_time }}</div>
      <div>{{ item.expired_time }}</div>
    </div>
    <div style="flex: 0.1 0 80px" class="mr-2">
      <span
        :class="item.status === 'ACTIVE' ? `status-active` : `status-expried`"
        >{{ item.status }}</span
      >
    </div>
    <div
      style="flex: 1 0 280px"
      class="mr-2 text-center justify-center align-center d-flex"
    >
      <table class="table-detail fs-12">
        <tr>
          <td class="title-detail">Location</td>
          <td v-if="item.detail">{{ item.detail.location }}</td>
          <td v-else></td>
        </tr>
        <tr>
          <td class="title-detail">HTTPS</td>
          <td
            v-if="item.detail"
            class="ip-copy"
            @click="onCopy(item.detail.http_ipv4)"
          >
            {{ item.detail.http_ipv4 }}
          </td>
          <td v-else></td>
        </tr>
        <tr>
          <td class="title-detail">Socks5</td>
          <td
            v-if="item.detail"
            class="ip-copy"
            @click="onCopy(item.detail.socks_ipv4)"
          >
            {{ item.detail.socks_ipv4 }}
          </td>
          <td v-else></td>
        </tr>
        <tr>
          <td class="title-detail">Local</td>
          <td
            v-if="item.detail"
            class="ip-copy"
            @click="onCopy(item.proxyLocal)"
          >
            {{ item.proxyLocal }}
          </td>
          <td v-else></td>
        </tr>
      </table>
    </div>
    <div style="flex: 1 0 100px" class="text-center">
      <div class="d-inline-block">
        <v-btn
          small
          class="btn-action"
          @click="getNewIp(item, true)"
          :loading="item.isLoading"
        >
          <v-icon small class="mr-1">{{ icons.mdiAutoFix }}</v-icon
          >L???y IP M???i
          <span
            style="font-size: 12px"
            v-if="
              item.timeAutoChangeIP && item.timeAutoChangeIP > 0 && timeOut > 0
            "
            >: {{ timeOut }}</span
          >
        </v-btn>
        <v-btn small class="btn-action" @click="onClickChangeTimeIP(item)">
          <v-icon small class="mr-1">{{ icons.mdiTimerSyncOutline }}</v-icon
          >Th???i gian ?????i IP</v-btn
        >
        <!-- <v-btn disabled small class="btn-action">
          <v-icon small class="mr-1">{{ icons.mdiShieldAccount }}</v-icon
          >Quy???n truy c???p</v-btn
        >
        <v-btn disabled small class="btn-action">
          <v-icon small class="mr-1">{{ icons.mdiReload }}</v-icon
          >Gia h???n</v-btn
        >
        <v-btn disabled small class="btn-action">
          <v-icon small class="mr-1">{{ icons.mdiMapMarkerRadius }}</v-icon
          >Ch???n ?????a ??i???m</v-btn
        > -->
      </div>
    </div>
  </div>
</template>

<script>
import { clipboard, ipcRenderer } from "electron";
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
import util from "../utils";

export default {
  props: ["item", "publicIp"],
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
      timeOut: 0,
    };
  },
  mounted() {
    this.startThreadChangeIP();
  },
  methods: {
    async startThreadChangeIP() {
      while (true) {
        let license = this.item;
        if (license.status !== "EXPIRED" && license.timeAutoChangeIP > 0) {
          if (!this.timeOut || this.timeOut > license.timeAutoChangeIP) {
            this.timeOut = license.timeAutoChangeIP;
          } else {
            this.timeOut--;
          }
          if (this.timeOut === 0) {
            this.timeOut = license.timeAutoChangeIP;
            await this.getNewIp(license, false, {
              timeChangeIpLeft: license.timeAutoChangeIP,
            });
          } else {
            this.$emit("onUpdateLicense", { ...license });
          }
        }
        await util.sleep(1000);
      }
    },
    async onClickChangeTimeIP(license) {
      var result = await this.$swal.fire({
        title: "Th???i gian ?????i IP",
        showCancelButton: true,
        confirmButtonText: "L??u",
        cancelButtonText: "H???y",
        showLoaderOnConfirm: true,
        focusConfirm: true,
        customClass: {
          container: "position-absolute",
        },
        html: `<input type="number" value="${
          license.timeAutoChangeIP ? license.timeAutoChangeIP : 0
        }" placeholder="Nh???p th???i gian" id="swal-input1" class="swal2-input"> (gi??y)`,
        preConfirm: () => {
          return parseInt(document.getElementById("swal-input1").value);
        },
      });
      if (result.isConfirmed) {
        let timeAutoChangeIP = result.value ? result.value : 0;
        this.$emit("onUpdateLicense", { ...this.item, timeAutoChangeIP });
      }
    },
    async onCopy(text) {
      clipboard.writeText(text, "selection");
      this.$swal.fire({
        icon: "success",
        title: "???? Copy",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1000,
      });
    },
    async getNewIp(license, isShowAlert, newData) {
      this.$emit("onUpdateLicense", { ...license, isLoading: true });
      let result = await ApiProxy.getNewProxy(license.api_key, this.publicIp);
      if (result.status === Constant.STATUS.SUCCESS) {
        let detail = result.data;
        ipcRenderer.sendSync("reset-server-proxy", {
          proxyUpstream: "http://" + result.data.http_ipv4,
          portLocal: license.portLocal,
        });
        this.$emit("onUpdateLicense", {
          ...license,
          detail,
          isLoading: false,
          ...newData,
        });
        if (isShowAlert) {
          this.$swal.fire({
            icon: "success",
            title: "L???y IP M???i Th??nh C??ng",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1000,
          });
        }
      } else {
        this.$emit("onUpdateLicense", {
          ...license,
          isLoading: false,
          ...newData,
        });
        if (isShowAlert) {
          this.$swal.fire({
            icon: "error",
            title: "L???i L???y IP M???i",
            text: result.data.message,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1000,
          });
        }
      }
    },
  },
  beforeUpdate() {
    console.log(" =================== beforeUpdate ================ ");
  },
};
</script>

<style scoped>
.wraper-folder {
  border: 1px solid gray;
  padding: 0px 10px;
  border-radius: 3px;
}

.status-expried {
  color: red;
}
.status-active {
  color: green;
}

.table-detail {
  border: 1px solid gray;
  border-collapse: collapse;
}

.table-detail > tr {
  border-bottom: 1px solid black;
}
.table-detail > tr > td:first-child {
  border-right: 2px solid gray;
  padding: 5px 10px 5px 10px;
}

.table-detail > tr > td:last-child {
  border-right: 2px solid gray;
  max-width: 200px;
  min-width: 200px;
  padding: 5px 10px 5px 10px;
}

.ip-copy {
  user-select: none;
  cursor: pointer;
}
.ip-copy:hover {
  background-color: rgb(117, 164, 252);
}

.btn-action {
  font-size: 10px;
  margin-bottom: 1px;
  width: 120px;
  font-weight: bold;
  border-radius: 30.5px;
  text-transform: uppercase !important;
  padding: 8px 16px;
  height: auto;
  background-color: rgb(241, 241, 241);
  background-image: linear-gradient(100deg, rgb(65, 182, 82), rgb(18, 95, 42));
  color: rgb(255, 255, 255);
  border: none;
  box-shadow: none !important;
  display: block;
}

.api-key {
  user-select: none;
  cursor: pointer;
}
.api-key:hover {
  background-color: rgb(117, 164, 252);
}
span {
  overflow-wrap: break-word;
}
.title-detail {
  font-weight: 500;
}
</style>
