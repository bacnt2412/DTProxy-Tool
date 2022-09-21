<template>
  <div class="d-flex py-2" style="position: relative">
    <div class="d-flex align-center" style="flex: 0.1 0 100px">
      <v-checkbox class="reset pl-2" hide-details=""></v-checkbox>
      <span class="ml-2"> {{ item.stt + 1 }}</span>
    </div>
    <div style="flex: 1 0 100px" class="mr-2">
      <span>
        {{ new Date() }}
      </span>
    </div>
    <div style="flex: 1 0 100px" class="mr-2">
      <div class="api-key" @click="onCopy(item.api_key)">
        <span>{{ item.api_key }}</span>
      </div>
    </div>
    <div style="flex: 1 0 100px" class="mr-2">
      <span>{{ item.start_time }} / {{ item.expired_time }}</span>
    </div>
    <div style="flex: 1 0 100px" class="mr-2">
      <span
        :class="item.status === 'ACTIVE' ? `status-active` : `status-expried`"
        >{{ item.status }}</span
      >
    </div>
    <div style="flex: 1 0 100px" class="mr-2">
      <div>
        <table class="table-detail">
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
    </div>
    <div style="flex: 1 0 100px" class="text-center">
      <div class="d-inline-block">
        <v-btn
          small
          class="btn-action"
          @click="getNewIp(item)"
          :loading="item.isLoading"
        >
          <v-icon small class="mr-1">{{ icons.mdiAutoFix }}</v-icon
          >Lấy IP Mới</v-btn
        >
        <v-btn disabled small class="btn-action">
          <v-icon small class="mr-1">{{ icons.mdiShieldAccount }}</v-icon
          >Quyền truy cập</v-btn
        >
        <v-btn disabled small class="btn-action">
          <v-icon small class="mr-1">{{ icons.mdiReload }}</v-icon
          >Gia hạn</v-btn
        >
        <v-btn disabled small class="btn-action">
          <v-icon small class="mr-1">{{ icons.mdiMapMarkerRadius }}</v-icon
          >Chọn địa điểm</v-btn
        >
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
} from "@mdi/js";
import ApiProxy from "../apiProxy";
import Constant from "../Constant";
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
      },
    };
  },
  methods: {
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
    async getNewIp(license) {
      this.$emit("onUpdateLicense", { ...license, isLoading: true });
      let result = await ApiProxy.getNewProxy(license.api_key, this.publicIp);
      if (result.status === Constant.STATUS.SUCCESS) {
        let detail = result.data;
        let data = ipcRenderer.sendSync("reset-server-proxy", {
          proxyUpstream: "http://" + result.data.http_ipv4,
          portLocal: license.portLocal,
        });
        this.$emit("onUpdateLicense", { ...license, detail, isLoading: false });
        this.$swal.fire({
          icon: "success",
          title: "Lấy IP Mới Thành Công",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        console.log(' #### ', result);
        this.$emit("onUpdateLicense", { ...license, isLoading: false });
        this.$swal.fire({
          icon: "error",
          title: "Lỗi Lấy IP Mới",
          text: result.data.message,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1000,
        });
      }
    },
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
