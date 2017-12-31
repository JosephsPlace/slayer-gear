// import json from '/assets/json/equpiment.json';
// console.log(json);
let VueObj = new Vue({
    el: "#app",
    data: {
        ge_base_url: 'https://cors-anywhere.herokuapp.com/http://services.runescape.com/m=itemdb_oldschool/',
        equipment_list: [],
        task_list: [],
        default_mob: {
            'defense-level' : {
                'stab': 102,
                'slash': 102,
                'crush': 102,
                'magic': 1,
                'ranged': 102
            },
            'defense-bonus': {
                'stab': 0,
                'slash': 0,
                'crush': 0,
                'magic': 0,
                'ranged': 0
            }
        },
        user_levels: {
            'attack' : 99,
            'strength' : 99,
            'defense' :  99,
            'ranged' : 99,
            'magic' : 99
        }
    },

    created: function () {
        Vue.http.headers.common['Access-Control-Allow-Origin'] = '*';
        Vue.http.headers.common['Accept'] = '*/*';

        this.$http.get('./assets/json/tasks.json').then((data) => {
            this.task_list = data.body;
        });

        // Get template
        this.$http.get('./assets/json/equipment.json').then((data) => {
            let equipment = data.body;

            this.$http.get(this.ge_base_url + 'api/catalogue/detail.json?item=4714').then((price_data) => {
                console.log(price_data);
            });

            console.log(data);
            for (let key in equipment) {
                if (equipment[key]['combat-style'] === 'melee') {
                    console.log(equipment[key]['item-name']);
                    equipment[key]['dps'] = this.calculateMeleeDPS(equipment[key]['stats'], equipment[key]['tags']);
                }
                // this.$http.jsonp(this.ge_base_url + 'api/catalogue/detail.json?item=' + key).then((price_data) => {
                //     console.log(price_data);
                // });
            }
            // for (let key in data.body) {
            //     this.$http.jsonp(this.ge_base_url + 'api/catalogue/detail.json?item=' + key).then((price_data) => {
            //         console.log(price_data);
            //     });
            // }
        });
    },

    methods: {
        calculateMeleeDPS: function(stats, tags) {
            let max_type = 0;
            let max_type_name  = '';
            let strength = stats['other']['melee-str'];
            let accuracy = 0;
            let tags_obj = tags.split(",");
            let is_strength = false;
            let mob_defense_roll = {
                'stab': (this.default_mob["defense-level"].stab + 9) * (64 + this.default_mob["defense-bonus"].stab),
                'slash': (this.default_mob["defense-level"].slash + 9) * (64 + this.default_mob["defense-bonus"].slash),
                'crush': (this.default_mob["defense-level"].crush + 9) * (64 + this.default_mob["defense-bonus"].crush),
                'magic': (this.default_mob["defense-level"].magic + 9) * (64 + this.default_mob["defense-bonus"].magic),
                'ranged': (this.default_mob["defense-level"].ranged + 9) * (64 + this.default_mob["defense-bonus"].ranged),
            };
            console.log(mob_defense_roll);

            for (let tag in tags_obj) {
                if (tags_obj[tag].trim() === 'strength') {
                    is_strength = true;
                }
            }

            for( let type in stats['attack']) {
                if (stats['attack'][type] > max_type) {
                    max_type = stats['attack'][type];
                    max_type_name = type;
                }
            }

            let effective_attack = this.user_levels.attack + 8;
            let effective_strength = this.user_levels.strength + 8;

            if (is_strength === true) {
                effective_strength += 3;
            } else {
                effective_attack += 3;
            }

            let max_hit = Math.floor((0.5 + effective_strength * (64 + strength) / 640));
            let max_attack_roll = Math.floor(effective_attack * (max_type + 64));
            let max_mob_defense_roll = mob_defense_roll[max_type_name];
            if (max_attack_roll > max_mob_defense_roll) {
                accuracy = 1 - (max_mob_defense_roll + 2) / (2 * (max_attack_roll + 1))
            } else {
                accuracy = max_attack_roll / (2 * (max_mob_defense_roll + 1));
            }
            let average_damage = ((max_hit * (max_hit + 1) / 2)) / (max_hit + 1);
            average_damage = average_damage * accuracy;

            return average_damage / stats['speed'];
        },
    }
});