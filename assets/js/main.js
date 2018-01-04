let VueObj = new Vue({
    el: "#app",
    data: {
        // ge_base_url: 'https://cors-anywhere.herokuapp.com/https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=',
        user_base_url: 'https://cors-anywhere.herokuapp.com/http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=',
        //ge_base_url: 'https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=',
        rsb_base_url: 'https://api.rsbuddy.com/grandExchange?a=guidePrice&i=',

        step: 1,
        equipment_list: [],
        task_list: [],
        total_task_weight: 0,
        price_list: [],
        selected_mobs: [],
        average_mob: {
            'combat': {
                'attack': 0,
                'strength': 0,
                'defense': 0,
                'magic': 0,
                'ranged': 0
            },
            'attack': {
                'stab': 0,
                'slash': 0,
                'crush': 0,
                'magic': 0,
                'range': 0
            },
            'defense': {
                'stab': 0,
                'slash': 0,
                'crush': 0,
                'magic': 0,
                'range': 0
            }
        },
        username: '',
        user_levels: {
            'attack': 1,
            'strength': 1,
            'defense': 1,
            'ranged': 1,
            'magic': 1
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
            'melee': 0,
            'range': 0,
            'magic': 0,
            'aoe': 0,
        },
        base_dps: {
            'melee': 0,
            'range': 0,
            'magic-trident': 0,
            'magic-ancients': 0
        },
        base_dps_stats: {
            'melee': {
                "speed": 3,
                "attack": {
                    "stab": 0,
                    "slash": 0,
                    "crush": 0,
                    "magic": 0,
                    "range": 0
                },
                "defense": {
                    "stab": 0,
                    "slash": 0,
                    "crush": 0,
                    "magic": 0,
                    "range": 0
                },
                "other": {
                    "melee-str": 0,
                    "range-str": 0,
                    "magic-str": 0,
                    "prayer": 0
                }
            },
            'range': {
                "speed": 1.2,
                "attack": {
                    "stab": 0,
                    "slash": 0,
                    "crush": 0,
                    "magic": 0,
                    "range": 0
                },
                "defense": {
                    "stab": 0,
                    "slash": 0,
                    "crush": 0,
                    "magic": 0,
                    "range": 0
                },
                "other": {
                    "melee-str": 0,
                    "range-str": 0,
                    "magic-str": 0,
                    "prayer": 0
                }
            },
            'magic-trident': {
                "speed": 2.4,
                "attack": {
                    "stab": 0,
                    "slash": 0,
                    "crush": 0,
                    "magic": 0,
                    "range": 0
                },
                "defense": {
                    "stab": 0,
                    "slash": 0,
                    "crush": 0,
                    "magic": 0,
                    "range": 0
                },
                "other": {
                    "melee-str": 0,
                    "range-str": 0,
                    "magic-str": 0,
                    "prayer": 0
                }
            },
            'magic-ancients': {
                "speed": 3,
                "attack": {
                    "stab": 0,
                    "slash": 0,
                    "crush": 0,
                    "magic": 0,
                    "range": 0
                },
                "defense": {
                    "stab": 0,
                    "slash": 0,
                    "crush": 0,
                    "magic": 0,
                    "range": 0
                },
                "other": {
                    "melee-str": 0,
                    "range-str": 0,
                    "magic-str": 0,
                    "prayer": 0
                }
            }
        }
    },

    created: function () {
        this.$http.get('./assets/json/tasks.json').then((data) => {
            this.task_list = data.body;
            this.total_task_weight = 0;

            for (let task in data.body) {
                this.total_task_weight += data.body[task]['task-weight'];
            }
        });

        //console.log(this.calculateDPS(this.base_dps_stats['magic-trident'], 'base-dps, trident-seas-max-hit,', 'magic'));

        // this.$http.get('./assets/json/prices.json').then((data) => {
        //     this.price_list = data.body;
        //
        //     this.getEquipment();
        // });

        //this.getEquipment();
    },

    methods: {
        calculateCombatStyle: function() {
            let total_selected_count = 0;
            let melee_selected = document.querySelectorAll('.melee-style');
            let range_selected = document.querySelectorAll('.range-style');
            let magic_selected = document.querySelectorAll('.magic-style');
            let aoe_selected = document.querySelectorAll('.aoe-style');

            let current_value = 0;

            this.task_styles = {
                'melee' : 0.0,
                'range' : 0.0,
                'magic' : 0.0,
                'aoe': 0.0
            };

            for (let i = 0; i < melee_selected.length; i++) {
                if (melee_selected[i].checked === true) {

                }
            }

            for (let i = 0; i < range_selected.length; i++) {
                if (range_selected[i].checked === true) {

                }
            }

            for (let i = 0; i < magic_selected.length; i++) {
                if (magic_selected[i].checked === true) {

                }
            }

            for (let i = 0; i < aoe_selected.length; i++) {
                if (aoe_selected[i].checked === true) {

                }
            }
        },
        selectMonster: function(monster) {
            let deleted = false;
            for (let task in this.task_list) {
                if (typeof this.selected_mobs[task] !== 'undefined' && task === monster['monster-name']) {
                    delete this.selected_mobs[task];
                    deleted = true;
                }
            }

            if (deleted === false) {
                this.selected_mobs[monster['monster-name']] = monster;
            }

            this.calculateAverageMob();
        },
        calculateAverageMob: function() {
            let average_defense = 0;
            let current_weight = 0;

            this.total_task_weight = 0;
            for (let task in this.selected_mobs) {
                current_weight += this.selected_mobs[task]['task-weight'];
                this.total_task_weight += this.selected_mobs[task]['task-weight'];
            }

            this.average_mob = {
                'combat': {
                    'attack': 0,
                    'strength': 0,
                    'defense': 0,
                    'magic': 0,
                    'ranged': 0
                },
                'attack': {
                    'stab': 0,
                    'slash': 0,
                    'crush': 0,
                    'magic': 0,
                    'range': 0
                },
                'defense': {
                    'stab': 0,
                    'slash': 0,
                    'crush': 0,
                    'magic': 0,
                    'range': 0
                }
            };

            for (let task in this.selected_mobs) {
                this.average_mob = {
                    'combat': {
                        'attack': this.average_mob.combat.attack + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['combat']['attack']),
                        'strength': this.average_mob.combat.strength + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['combat']['strength']),
                        'defense': this.average_mob.combat.defense + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['combat']['defense']),
                        'magic': this.average_mob.combat.magic + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['combat']['magic']),
                        'range': this.average_mob.combat.range + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['combat']['range'])
                    },
                    'attack': {
                        'stab': this.average_mob.attack.stab + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['attack']['stab']),
                        'slash': this.average_mob.attack.slash +  Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['attack']['slash']),
                        'crush': this.average_mob.attack.crush +  Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['attack']['crush']),
                        'magic': this.average_mob.attack.magic +  Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['attack']['magic']),
                        'range': this.average_mob.attack.range +  Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['attack']['range'])
                    },
                    'defense': {
                        'stab': this.average_mob.defense.stab + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['defense']['stab']),
                        'slash': this.average_mob.defense.slash + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['defense']['slash']),
                        'crush': this.average_mob.defense.crush + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['defense']['crush']),
                        'magic': this.average_mob.defense.magic + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['defense']['magic']),
                        'range': this.average_mob.defense.range + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['defense']['range'])
                    }
                };
                average_defense += Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['combat']['defense']);
            }
        },
        setUsername: function () {
            let username = this.username;
            this.$http.get(this.user_base_url + username, {
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

                this.step = 2;
            });
        },
        getEquipment: function () {
            this.$http.get('./assets/json/equipment.json').then((data) => {
                let equipment = data.body;

                let base_dps = {
                    'melee': this.calculateDPS(this.base_dps_stats['melee'], 'base-dps', 'melee'),
                    'range': this.calculateDPS(this.base_dps_stats['range'], 'base-dps', 'range'),
                    'magic-trident': this.calculateDPS(this.base_dps_stats['magic-trident'], 'base-dps, trident-max-hit', 'magic'),
                    'magic-ancients': this.calculateDPS(this.base_dps_stats['magic-ancients'], 'base-dps, ancients-max-hit,', 'magic'),
                }

                for (let key in equipment) {
                    equipment[key]['dps'] = this.calculateDPS(equipment[key]['stats'], equipment[key]['tags'], equipment[key]['combat-style']);

                    if (isNaN(equipment[key]['dps'])) {
                        equipment[key]['dps'] = 0;
                    }

                    if(equipment[key]['item-slot'] !== 'main hand') {
                        if (equipment[key]['combat-style'] === 'melee') {
                            equipment[key]['dps'] -= base_dps['melee'];
                        }
                        if (equipment[key]['combat-style'] === 'range') {
                            equipment[key]['dps'] -= base_dps['range'];
                        }
                    }
                    if(equipment[key]['item-slot'] !== 'main hand' && equipment[key]['combat-style'] === 'magic') {
                        equipment[key]['dps'] -= base_dps['magic-trident'];
                    }

                    if(equipment[key]['item-slot'] === 'main hand' && equipment[key]['combat-style'] === 'magic') {
                        let tags_obj = equipment[key]['tags'].split(",");
                        let aoe = false;
                        for (let tag in tags_obj) {
                            if (tags_obj[tag] === 'aoe') {
                                equipment[key]['dps'] -=  base_dps['magic-ancients'];
                            } else {
                                //equipment[key]['dps'] -=  base_dps['magic-trident'];
                            }
                            equipment[key]['rank'] = (1000000 * (equipment[key]['dps'] / equipment[key]['price'])) * (1 + (this.task_styles[equipment[key]['combat-style']] * this.task_styles['aoe']));
                        }
                    }

                    equipment[key]['price'] = this.getItemPrice(this.price_list[key]['price-data'].item.current.price);
                    equipment[key]['rank'] = (1000000 * (equipment[key]['dps'] / equipment[key]['price'])) * (1 + this.task_styles[equipment[key]['combat-style']]);
                }

                let sortable_equipment = [];
                for (let item in equipment) {
                    sortable_equipment.push(equipment[item]);
                }

                sortable_equipment.sort((a, b) => {
                    return a.rank - b.rank;
                });

                sortable_equipment.reverse();

                console.log(sortable_equipment);
            });
        },
        getItemPrice: function (short_price) {
            let whole_price = short_price;
            let last_letter = whole_price.slice(-1);
            let final_price = whole_price.slice(0, -1);

            if (last_letter === 'm') {
                final_price *= 1000000;
            } else if (last_letter === 'k') {
                final_price *= 1000;
            }

            return final_price;
        },
        calculateDPS: function (stats, tags, style) {
            let max_type = 0;
            let max_type_name = 'crush';
            let attack_speed = this.attack_speed[style];
            let accuracy = 0;
            let max_hit = 0;
            let strength = 0;
            let effective_attack = 0;
            let effective_strength = 0;
            let tags_obj = tags.split(",");
            let is_strength = false;
            let is_crush = false;
            let mob_defense_roll = {
                'stab': (this.average_mob["combat"].defense + 9) * (64 + this.average_mob["defense"].stab),
                'slash': (this.average_mob["combat"].defense + 9) * (64 + this.average_mob["defense"].slash),
                'crush': (this.average_mob["combat"].defense + 9) * (64 + this.average_mob["defense"].crush),
                'magic': (this.average_mob["combat"].magic + 9) * (64 + this.average_mob["defense"].magic),
                'ranged': (this.average_mob["combat"].range + 9) * (64 + this.average_mob["defense"].range),
            };

            if (style === 'melee') {
                strength = stats['other']['melee-str'];


                for (let tag in tags_obj) {
                    if (tags_obj[tag].trim() === 'strength') {
                        is_strength = true;
                    }
                    if (tags_obj[tag].trim() === 'crush') {
                        is_crush = true;
                    }
                }

                if (is_crush === true) {
                    max_type = stats['attack']['crush'];
                    max_type_name = 'crush';
                } else {
                    for (let type in stats['attack']) {
                        if (stats['attack'][type] > max_type) {
                            max_type = stats['attack'][type];
                            max_type_name = type;
                        }
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

                max_hit = Math.floor(0.5 + effective_strength * (64 + strength) / 640);
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
                    stats['speed'] = 2.4;
                } else if (is_ancients === true) {
                    max_hit = 26;
                } else {
                    max_hit = Math.floor((this.user_levels.magic / 3) - 2);
                    stats['speed'] = 2.4;
                }

                if (strength !== 0) {
                    //max_hit = Math.floor(max_hit * (1 + (strength / 100)));
                    max_hit = max_hit * (1 + (strength / 100));
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