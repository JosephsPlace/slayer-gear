// import json from '/assets/json/equpiment.json';
// console.log(json);
let VueObj = new Vue({
    el: "#app",
    data: {
        // ge_base_url: 'https://cors-anywhere.herokuapp.com/https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=',
        user_base_url: 'https://cors-anywhere.herokuapp.com/http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=',
        ge_base_url: 'https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=',
        rsb_base_url: 'https://api.rsbuddy.com/grandExchange?a=guidePrice&i=',

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
        username: '',
        user_levels: {
            'attack' : 99,
            'strength' : 99,
            'defense' :  99,
            'ranged' : 99,
            'magic' : 99
        },
        // These attack speeds will be set to the starting loadout and will change when new weapons are bought
        attack_speed: {
            // Dragon Scimmy speed
            'melee': 2.4,
            // Rune Crossbow speed
            'range': 3.6,
            // Trident of the Seas speed
            'magic': 2.4
        },
        task_styles: {
            'melee': 33.333,
            'range': 33.333,
            'magic': 33.333
        }
    },

    created: function () {
        this.$http.get('./assets/json/tasks.json').then((data) => {
            this.task_list = data.body;
        });

        //this.getEquipment();
    },

    methods: {
        setUsername: function () {
            let username = this.username;
            this.$http.get(this.user_base_url + username,{
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Accept': '*/*'
                }
            }).then((user_data) => {
                let all_user_data = user_data.body.split("\n");

                let combat_data = {
                    "attack": all_user_data[1].split(","),
                    "defense": all_user_data[2].split(","),
                    "strength": all_user_data[3].split(","),
                    "hitpoints": all_user_data[4].split(","),
                    "ranged": all_user_data[5].split(","),
                    "magic": all_user_data[7].split(","),
                };

                this.user_levels.attack = parseInt(combat_data.attack[1]);
                this.user_levels.defense = parseInt(combat_data.defense[1]);
                this.user_levels.strength = parseInt(combat_data.strength[1]);
                this.user_levels.hitpoints = parseInt(combat_data.hitpoints[1]);
                this.user_levels.ranged = parseInt(combat_data.ranged[1]);
                this.user_levels.magic = parseInt(combat_data.magic[1]);

                console.log(this.user_levels);
                //this.getEquipment();
            });
        },
        getEquipment: function() {
            // Get template
            this.$http.get('./assets/json/equipment.json').then((data) => {
                let equipment = data.body;

                for (let key in equipment) {
                    //equipment[key]['dps'] = this.calculateDPS(equipment[key]['stats'], equipment[key]['tags'], equipment[key]['combat-style']);

                    // if (isNaN(equipment[key]['dps'])) {
                    //     equipment[key]['dps'] = 0;
                    // }

                    this.$http.get(this.ge_base_url + key, {
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Accept': '*/*'
                        }
                    }).then((price_data) => {
                        //equipment[key]['price'] = this.getItemPrice(price_data.body.item.current.price);
                        console.log(price_data);
                        //this.equipment_list = equipment;
                    });
                }
                console.log('done');
            });
        },
        getItemPrice: function (short_price) {
            let whole_price = short_price;
            let last_letter = whole_price.slice(-1);
            let final_price = whole_price.slice(0, -1);

            if (last_letter === 'm') {
                final_price *= 1000000;
            } else if(last_letter === 'k') {
                final_price *= 1000;
            }

            return final_price;
        },
        calculateDPS: function(stats, tags, style) {
            let max_type = 0;
            let max_type_name  = '';
            let attack_speed = this.attack_speed[style];
            let accuracy = 0;
            let max_hit = 0;
            let strength = 0;
            let effective_attack = 0;
            let effective_strength = 0;
            let tags_obj = tags.split(",");
            let is_strength = false;
            let mob_defense_roll = {
                'stab': (this.default_mob["defense-level"].stab + 9) * (64 + this.default_mob["defense-bonus"].stab),
                'slash': (this.default_mob["defense-level"].slash + 9) * (64 + this.default_mob["defense-bonus"].slash),
                'crush': (this.default_mob["defense-level"].crush + 9) * (64 + this.default_mob["defense-bonus"].crush),
                'magic': (this.default_mob["defense-level"].magic + 9) * (64 + this.default_mob["defense-bonus"].magic),
                'ranged': (this.default_mob["defense-level"].ranged + 9) * (64 + this.default_mob["defense-bonus"].ranged),
            };

            if (style === 'melee') {
                strength = stats['other']['melee-str'];

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

                effective_attack = this.user_levels.attack + 8;
                effective_strength = this.user_levels.strength + 8;

                if (is_strength === true) {
                    effective_strength += 3;
                } else {
                    effective_attack += 3;
                }

                max_hit = Math.floor((0.5 + effective_strength * (64 + strength) / 640));
            } else if (style === 'range') {
                strength = stats['other']['range-str'];

                max_type = stats['attack']['range'];
                max_type_name = 'ranged';

                effective_attack = this.user_levels.ranged + 8;
                effective_strength = this.user_levels.ranged + 8;

                max_hit = Math.floor((0.5 + effective_strength * (64 + strength) / 640));
            } else if (style === 'magic') {
                strength = stats['other']['magic-str'];

                max_type = stats['attack']['magic'];
                max_type_name = 'magic';

                // If this is still here, magic calculations will be based off of Ice Blitz

                let is_trident = false;
                let is_ancients = false;

                for (let tag in tags_obj) {
                    if (tags_obj[tag].trim() === 'trident-max-hit') {
                        is_trident = true;
                    }
                    if (tags_obj[tag].trim() === 'ancients-max-hit') {
                        is_ancients = true;
                    }
                }

                if (is_trident === true) {
                    max_hit = Math.floor((this.user_levels.magic / 3) - 2);
                } else if (is_ancients === true) {
                    max_hit = 26;
                } else {
                    max_hit = 1;
                }

                if (strength !== 0) {
                    max_hit = Math.floor(max_hit * (1 + (strength / 100)));
                }

                effective_attack = this.user_levels.magic + 8;
                effective_strength = this.user_levels.magic + 8;
            }

            let max_attack_roll = Math.floor(effective_attack * (max_type + 64));
            let max_mob_defense_roll = mob_defense_roll[max_type_name];
            if (max_attack_roll > max_mob_defense_roll) {
                accuracy = 1 - (max_mob_defense_roll + 2) / (2 * (max_attack_roll + 1))
            } else {
                accuracy = max_attack_roll / (2 * (max_mob_defense_roll + 1));
            }
            let average_damage = ((max_hit * (max_hit + 1) / 2)) / (max_hit + 1);
            average_damage = average_damage * accuracy;

            if (typeof stats['speed'] !== 'undefined') {
                attack_speed = stats['speed'];
                this.attack_speed[style] = stats['speed'];
            }

            return average_damage / attack_speed;
        },
    }
});