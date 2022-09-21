<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
            <v-card-title>
                <span class=""> Cài đặt chung</span>
                <v-spacer></v-spacer>
                <v-btn icon @click="dialog = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="pb-0">
                <v-container>
                    <div class="d-flex align-center my-2">
                        <span style="width: 100px; color: black !important">Token User:</span>
                        <v-textarea class="mx-2" outlined dense hide-details="" rows="2" v-model="tokenApi"> </v-textarea>
                    </div>
                </v-container>
            </v-card-text>
            <v-card-actions class="text-center d-block pb-4">
                <v-btn color="light" @click="dialog = false"> Hủy </v-btn>
                <v-btn color="success" class="px-10 ml-3" @click="onSaveSettings"> Lưu </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
const Store = require('electron-store');
const store = new Store();

export default {
    data() {
        return {
            dialog: false,
            tokenApi: '',
        };
    },
    methods: {
        onSaveSettings() {
            this.hide();
            store.set('tokenApi', this.tokenApi);
        },
        getSettings() {
            this.tokenApi = store.get('tokenApi') || '';
        },
        show() {
            this.dialog = true;
            this.getSettings();
        },
        hide() {
            this.dialog = false;
        },
    },
};
</script>

<style></style>
