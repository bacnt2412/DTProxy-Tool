<template>
    <v-app>
        <v-app-bar app height="32" class="app">
            <span class="button-app-bar" @click="$refs.ModalSettingApp.show()"><v-icon size="16">mdi-cog</v-icon> Cấu hình api key</span>
        </v-app-bar>
        <v-main>
            <router-view />
        </v-main>
        <ModalSettingApp ref="ModalSettingApp" />
    </v-app>
</template>

<script>
import ModalSettingApp from './components/ModalSetupApp.vue';
export default {
    name: 'App',
    data: () => ({}),
    components: {
        ModalSettingApp,
    },
    methods: {
    },
    created() {},
};
</script>

<style>
.button-app-bar {
    font-size: 13px;
    background: white;
    cursor: pointer;
    border: 1px solid gray;
    padding: 2px 5px;
    border-radius: 5px;
}
#search-textarea {
    line-height: 1.2 !important;
}

.theme--light.v-data-table tbody tr.v-data-table__selected {
    background: #9bd4ff !important;
}
.theme--light.v-data-table tbody tr:hover {
    background: #9bd4ff !important;
}
td.text-start:first {
    /* border-right: 1px solid rgb(201, 201, 201) !important; */
    border-left: 1px solid rgb(201, 201, 201) !important;
}
#table-account > div > table > thead > tr > th {
    border-right: 1px solid rgb(201, 201, 201) !important;
    color: black;
    /* border-left: 1px solid rgb(201, 201, 201) !important; */
}

#table-account > div > table > tbody > tr > td {
    border-right: 1px solid rgb(201, 201, 201) !important;
    /* border-left: 1px solid rgb(201, 201, 201) !important; */
}
#table-account > div > table > tbody > tr > td {
    border-right: 1px solid rgb(201, 201, 201) !important;
    /* border-left: 1px solid rgb(201, 201, 201) !important; */
}

.app {
    background-color: red; /* For browsers that do not support gradients */
    background-image: linear-gradient(to right, rgb(97, 160, 255), rgb(172, 236, 255));
}
.v-input--selection-controls__input {
    margin: 0px !important;
}
.v-input__control > .v-input__slot {
    min-height: 10px !important;
}
.v-input__icon.v-input__icon--append {
    font-size: 20px !important;
    padding-bottom: 5px;
}
.v-text-field.v-text-field--solo.v-input--dense > .v-input__control {
    min-height: 10px !important;
}

.v-label {
    font-size: 10px;
}

.v-label {
    font-size: 14px !important;
}

.v-input {
    font-size: 14px !important;
}

.small-radio i {
    font-size: 19px;
}
.small-radio label {
    font-size: 14px;
    padding-left: 0px;
    margin-left: -4px;
    font-weight: 400;
    color: black !important;
}
.small-radio .v-radio {
    padding: 0px;
}
.small-radio [class*='__ripple'] {
    left: 0;
}

.radius-20 {
    border-radius: 20px;
}
.v-tabs-slider-wrapper {
    height: 0px !important;
}
.v-tab--active {
    color: black !important;
    font-weight: bold;
}
.v-application {
    font-family: 'Roboto', 'Arial', sans-serif !important;
    font-weight: 400 !important;
}
html {
    overflow-y: hidden !important;
}
body {
    height: 100vh;
    font-family: 'Roboto', sans-serif;
    font-weight: 400 !important;
}
#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
    font-family: 'Roboto', sans-serif;
    font-weight: 400 !important;
}
#main {
    overflow-y: auto;
}

.v-btn {
    text-transform: none !important;
}

.reset {
    margin: 0px !important;
    padding: 0px !important;
}
.color-picker-container {
    box-shadow: 1px 1px 10px black !important;
}
.text-bold {
    font-weight: bold;
}
.truncate-text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.fa-trash-alt:hover {
    color: red;
}

.fs-20 {
    font-size: 20px !important;
}
.fs-18 {
    font-size: 18px !important;
}
.fs-16 {
    font-size: 16px !important;
}
.fs-15 {
    font-size: 15px !important;
}
.fs-13 {
    font-size: 13px !important;
}
.fs-14 {
    font-size: 14px !important;
}
.fs-12 {
    font-size: 12px !important;
}
.fs-10 {
    font-size: 10px !important;
}
.fs-sm {
    font-size: 0.875rem !important;
}
.fs-md {
    font-size: 1rem !important;
}
.fs-lg {
    font-size: 1.25rem !important;
}
.fs-xl {
    font-size: 1.5rem !important;
}
.btn-radius {
    border-radius: 50px !important;
}
.text-gray {
    color: rgb(100, 100, 100);
}


.btn-default {
    background-color: rgb(0, 152, 253) !important;
    color: white !important;
    font-weight: 500;
    border-radius: 7px;
}
.v-text-field__details {
    margin: 0 !important;
}
.icon-help-hover:hover {
    cursor: pointer;
}
</style>
