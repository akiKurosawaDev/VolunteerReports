const GAS = 'https://script.google.com/macros/s/AKfycbxQBAY0EVUlq0rwQKbQfkiqYx2zmPYsDTZqJMlmUB_-EfJW-FmA_qp6g8-DHuXYvg4R/exec';

/**
 * 奉仕報告クラスです。
 * @property {String} date - 日付文字列を取得または設定します。
 * @property {Number} distribute - 配布数を取得または設定します。
 * @property {Number} video - ビデオ再生数を取得または設定します。
 * @property {Number} time - 時間（分換算）を取得または設定します。
 * @property {Number} revisit - 再訪問数を取得または設定します。
 * @property {Number} study - 研究件数を取得または設定します。
 */
class VolunteerReports {
    constructor(date, distribute, video, time, revisit, study) {
      this.date = date;
      this.distribute = distribute;
      this.video = video;
      this.time = time;
      this.revisit = revisit;
      this.study = study;
    }
}

class User {
    /**
     * User インスタンスコンストラクタ
     * @param {string} id - ユーザーID
     * @param {string} password - パスワード 
     * @param {boolean} login - 認証可否
     */
    constructor(id, password, login) {
        this.id = id;
        this.password = password;
        this.login = login;
    }
}

const modalMessage = {
    props: {
        title: String,
        message: String,
        visible: Boolean
    },
    emits: ['from-close', 'from-send'],
    template: `<transition name="fade">
        <div v-show="visible" class="modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ title }}</h5>
                        <button type="button" class="btn-close" v-on:click="onClickClose" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>{{ message }}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" v-on:click="onClickClose">閉じる</button>
                        <button type="button" class="btn btn-primary" v-on:click="onClickSend">送信</button>
                    </div>
                </div>
            </div>
        </div>
    </transition>`,
    methods: {
        onClickClose(event) {
            this.$emit('from-close');
        },
        onClickSend(event) {
            this.$emit('from-send');
        }
    }
};

/**
 * Vue ローカルコンポーネントとして実装する modalDialog オブジェクトです。
 */
const modalDialog = {
    props: {
        title: String,
        visible: Boolean,
        default: { type: Object, default: function() { return new VolunteerReports('0/0/0', 0, 0, 0, 0, 0) } }
    },
    emits: ['from-close', 'from-send'],
    data() {
        return {
            reports: new VolunteerReports('0/0/0', 0, 0, 0, 0, 0)
        }
    },
    template: `<transition name="fade">
        <div v-show="visible" class="modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ title }}</h5>
                        <button type="button" class="btn-close" v-on:click="onClickClose" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="row m-2">
                                <label for="date_input" class="col-3 col-form-label">日付</label>
                                <div class="col">
                                    <input type="date" class="form-control" id="date_input" v-bind:value="todayUTCString" v-on:input="reports.date = dateConvert($event.target.value)">
                                </div>
                            </div>
                            <div class="row m-2">
                                <label for="distribute_input" class="col-3 col-form-label">配布数</label>
                                <div class="col">
                                    <input type="number" class="form-control" id="distribute_input" v-model.number="reports.distribute">
                                </div>
                            </div>
                            <div class="row m-2">
                                <label for="video_input" class="col-3 col-form-label">ビデオ再生数</label>
                                <div class="col">
                                    <input type="number" class="form-control" id="video_input" v-model.number="reports.video">
                                </div>
                            </div>
                            <div class="row m-2">
                                <label for="time_input" class="col-3 col-form-label">時間</label>
                                <div class="col">
                                    <input type="time" class="form-control" id="time_input" v-bind:value="timeString" v-on:input="reports.time = timeConvert($event.target.value)">
                                </div>
                            </div>
                            <div class="row m-2">
                                <label for="revisit_input" class="col-3 col-form-label">再訪問</label>
                                <div class="col">
                                    <input type="number" class="form-control" id="revisit_input" v-model.number="reports.revisit">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" v-on:click="onClickClose">閉じる</button>
                        <button type="button" class="btn btn-primary" v-on:click="onClickSend">送信</button>
                    </div>
                </div>
            </div>
        </div>
    </transition>`,
    mounted() {
        this.initialize();
    },
    computed: {
        /** reports データ内の date プロパティを「20YY-MM-dd」UTC書式文字列で取得します。 */
        todayUTCString() {
            const res = this.reports.date.split('/');
            return `${res[0]}-${res[1]}-${res[2]}`;
        },
        /** 現在の日付を「20YY/MM/DD」書式文字列で取得します。 */
        todayString() {
            const now = new Date(Date.now() + ((new Date).getTimezoneOffset() + 9 * 60) * 60 * 1000);
            const nowstr = `${now.getFullYear().toString()}/${('00' + (now.getMonth() + 1).toString()).slice(-2)}/${('00' + now.getDate().toString()).slice(-2)}`;

            return nowstr;
        },
        /** reports データ内の time プロパティを「HH:mm」書式文字列で取得します。 */
        timeString() {
            const hour = ('00' + String(Math.floor(Number(this.reports.time) / 60))).slice(-2);
            const minute = ('00' + String(Number(this.reports.time) % 60)).slice(-2);
            return `${hour}:${minute}`;
        }
    },
    methods: {
        /** reports オブジェクトを default プロパティで初期化します。 */
        initialize() {
            this.reports.date = this.default.date == '0/0/0' ? this.todayString : this.default.date;
            this.reports.distribute = this.default.distribute;
            this.reports.video = this.default.video;
            this.reports.time = this.default.time;
            this.reports.revisit = this.default.revisit;
            this.reports.study = this.default.study;
        },
        /**
         * UTC書式文字列「20YY-MM-dd」を JST書式文字列「20YY/MM/dd」に変換します。
         * @param {String} dateUTCString - 「20YY-MM-dd」UTC書式文字列。
         * @returns 「20YY/MM/dd」JST書式文字列。
         */
        dateConvert(dateUTCString) {
            const res = dateUTCString.split('-');
            return `${res[0]}/${res[1]}/${res[2]}`;
        },
        /**
         * 書式文字列「HH:mm」を分換算で時間数値に変換します。
         * @param {String} timeString - 「HH:mm」書式文字列。
         * @returns 分換算の時間数値。
         */
        timeConvert(timeString) {
            const res = timeString.split(':');
            const hour = Number(res[0]);
            const minute = Number(res[1]);

            return (hour * 60) + minute;
        },
        onClickClose(event) {
            this.$emit('from-close');
        },
        onClickSend(event) {
            this.$emit('from-send', this.reports, () => this.initialize());
        }
    },
    watch: {
        visible: {
            handler: function(newVal, oldVal) {
                if (newVal)
                    this.initialize();
            }
        }
    }
};

const calender = {
    props: {
        year: { type: Number },
        monthindex: { type: Number },
        regist: { type: Array }
    },
    emits: ['from-select'],
    data() {
        return {
            days: []
        }
    },
    computed: {
        getYear() { return Number(this.year) },
        getMonthIndex() { return Number(this.monthindex) },
        getRegist() {
            if (this.regist == null)
                return [];
            return this.regist;
        }
    },
    template: `<table class="calender">
        <thead>
            <tr class="week">
                <th class="wh">日</th>
                <th class="wh">月</th>
                <th class="wh">火</th>
                <th class="wh">水</th>
                <th class="wh">木</th>
                <th class="wh">金</th>
                <th class="wh">土</th>
            </tr>
        </thead>
        <tbody>
            <tr class="day" v-for="item in days">
                <td class="cell" v-for="elem in item" v-bind:id="elem.day"
                    v-on:click="onClickCell">
                    <div>{{ elem.day }}</div>
                    <div v-bind:class="elem.visible ? 'visible' : 'invisible'">
                        <i class="bi bi-record-fill text-success"></i>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>`,
    mounted() {
        this.createCalender();
    },
    methods: {
        createCalender() {
            // プロパティから年と月を取得
            const date = new Date(this.getYear, this.getMonthIndex);
        
            date.setDate(1); // 日付を月頭に設定
            const first = date.getDay(); // 月頭の曜日を取得
            date.setMonth(date.getMonth() + 1); // 翌月に設定
            date.setDate(0); // 翌月の前の日（当月の末日）に日付を設定
            const last = date.getDate(); // 月末の日付を取得
        
            let count = 1;
            const weeks = new Array(6);
            for (let i = 0; i < weeks.length; i++) {
                
                const days = new Array(7);
                for (let j = 0; j < days.length; j++) {
                    days[j] = { day: undefined, visible: false };
                    if ((i == 0 && j >= first) || (i > 0 && count <= last)) {
                        days[j].day = count++;
                    }
                }

                weeks[i] = days;
            }

            this.selectClear();
            this.days = weeks;
        },
        onClickCell(event) {
            this.selectClear();
        
            const find = this.getRegist.find((elem) => {
                const date = new Date(elem.date);
                const select = Number(event.currentTarget.id);
                return date.getDate() == select;
            })
            if (find !== undefined) {
                this.$emit('from-select', new VolunteerReports(find.date, find.distribute, find.video, find.time, find.revisit, find.study));
            } else {
                this.$emit('from-select', new VolunteerReports('0/0/0', 0, 0, 0, 0, 0));
            }
        
            event.currentTarget.classList.add('select');
        },
        /**
        * セルの選択状態を解除します。
        */
        selectClear() {
            const old = document.querySelector('.select');
            old?.classList.remove('select');

            this.$emit('from-select', new VolunteerReports('0/0/0', 0, 0, 0, 0, 0));
        }
    },
    watch: {
        monthindex: {
            handler: function() {
                this.createCalender();
            }
        },
        regist: {
            handler: function(newVal, oldVal) {
                const list = this.days.flat();
                console.log(`prev=${oldVal.length} -> new=${newVal.length}`);

                // delete
                if (newVal.length < oldVal.length) {
                    list.forEach(day => day.visible = false);
                }
                for (const item of this.getRegist) {
                    const date = new Date(item.date);
                    const find = list.find(day => Number(day.day) == date.getDate());
                    find.visible = true;
                }
                this.selectClear();
            },
            deep: true
        }
    }
};

const app = Vue.createApp({
    data() {
        return {
            authorization: new User('', '', false), // 認証情報
            commands: [false, false, false], // コマンドリスト
            detail: new VolunteerReports('0/0/0', 0, 0, 0, 0, 0), // 詳細情報
            add_dlg: false, // ダイアログ表示可否
            edi_dlg: false,
            del_dlg: false,
            load: [], // GAS データリスト
            monthIndex: -1, // 月インデックス（0から始まる）
            year: 0, // 西暦年

        }
    },
    mounted() {
        const now = new Date(Date.now() + ((new Date).getTimezoneOffset() + 9 * 60) * 60 * 1000);
        this.year = now.getFullYear();
        this.monthIndex = now.getMonth();
    },
    components: {
        'modal-message': modalMessage,
        'modal-dialog': modalDialog,
        'my-calender' : calender
    },
    computed: {
        timeString() {
            const hour = ('00' + String(Math.floor(Number(this.detail.time) / 60))).slice(-2);
            const minute = ('00' + String(Number(this.detail.time) % 60)).slice(-2);
            return `${hour}:${minute}`;
        }
    },
    methods: {
        async login() {
            const opt = {
                method: 'POST',
                body: JSON.stringify({
                    user: this.authorization,
                    method: 'LOGIN'
                })
            };

            const response = await fetch(GAS, opt);
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
            this.authorization = await response.json();
        },
        async getSheet(year, monthIndex) {
            const opt = {
                method: 'POST',
                body: JSON.stringify({
                    user: this.authorization,
                    method: 'GET',
                    request: {
                        year: String(year),
                        monthIndex: String(monthIndex)
                    }
                })
            };
        
            const response = await fetch(GAS, opt);
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
            const result = await response.json();
            this.load = Array.isArray(result) ? result : [];
        },
        async postReports(postData) {
            const opt = {
                method: 'POST',
                body: JSON.stringify({
                    user: this.authorization,
                    method: 'POST',
                    newrecord: postData
                })
            };
        
            const response = await fetch(GAS, opt);
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
            const result = await response.json();
            
            // GAS にデータ送信が成功した場合、load メンバーにもデータを追加（カレンダーに反映）
            if (result.date != null) {
                const current = new Date(result.date).getTime();
                const index = this.load.findIndex(element => {
                    const search =  new Date(element.date).getTime();
                    return current == search;
                });
                if (index == -1) {
                    const newList = this.load.slice();
                    newList.push(result);
                    this.load = newList;
                    console.log("配列末尾にアイテムを追加しました。");
                }
            }
        },
        async putReports(putData) {
            const opt = {
                method: 'POST',
                body: JSON.stringify({
                    user: this.authorization,
                    method: 'PUT',
                    editrecord: putData
                })
            };
        
            const response = await fetch(GAS, opt);
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
            const result = await response.json();
            
            // GAS にデータ送信が成功した場合、load メンバーのデータも変更（カレンダーに反映）
            if (result.date != null) {
                const current = new Date(result.date).getTime();
                const index = this.load.findIndex(element => {
                    const search =  new Date(element.date).getTime();
                    return current == search;
                });
                    
                if (index > -1) {
                    const newList = this.load.slice(); // copy
                    newList.splice(index, 1, result);
                    this.load = newList;
                    console.log(index + "番目のアイテムを置き換えました。");
                }
            }
        
        },
        async delRepots(delData) {
            const opt = {
                method: 'POST',
                body: JSON.stringify({
                    user: this.authorization,
                    method: 'DELETE',
                    delrecord: delData
                })
            };
        
            const response = await fetch(GAS, opt);
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
            const result = await response.json();

            // GAS にデータ送信が成功した場合、load メンバーのデータを削除（カレンダーに反映）
            if (result.date != null) {
                const current = new Date(result.date).getTime();
                const index = this.load.findIndex(element => {
                    const search = new Date(element.date).getTime();
                    return current == search;
                });

                if (index > -1) {
                    const newList = this.load.slice();
                    newList.splice(index, 1);
                    this.load = newList;
                    console.log(index + "番目のアイテムを削除しました。");
                }
            }
        },
        onClickLogin(event) {
            this.login();
        },
        onClickNext(event) {
            // 月インデックスが 11 の場合、カーソルが年末のため翌年始に設定
            if (this.monthIndex++ == 11) {
                this.year++;
                this.monthIndex = 0;
            }
        },
        onClickBack(event) {
            // 月インデックスが 0 の場合、カーソルが年始のため昨年末に設定
            if (this.monthIndex-- == 0) {
                this.year--;
                this.monthIndex = 11;
            }
        },
        async onSendDialog(event, initialize) {
            this.add_dlg = false;

            if (this.authorization.login) {
                await this.postReports(event);
            }
            
            initialize();
        },
        async onPutDialog(event, initialize) {
            this.edi_dlg = false;

            if (this.authorization.login) {
                await this.putReports(event);
            }
            
            initialize();
        },
        async onDelDialog() {
            this.del_dlg = false;

            if (this.authorization.login && this.detail != '0/0/0') {
                await this.delRepots(this.detail);
            }
        },
        showDetail(event) {
            this.detail = event;
        }
    },
    watch: {
        authorization: {
            handler: function() {
                if (this.authorization.login) {
                    this.getSheet(this.year, this.monthIndex);
                }
            }, 
            deep: true
        },
        monthIndex: {
            handler: function() {
                if (this.authorization.login) {
                    this.getSheet(this.year, this.monthIndex);
                }
            }
        },
        detail: {
            handler: function() {
                this.commands = this.detail.date == '0/0/0' ? [true, false, false] : [false, true, true];
            }
        }
    }

}).mount('#app');

