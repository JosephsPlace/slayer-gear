Vue.filter('round', function (value) {
    return Number((value).toFixed(2))
});

Vue.filter('price', function (value) {
    return value.toLocaleString();
});

let VueObj = new Vue({
    el: "#app",
    data: {
        // ge_base_url: 'https://cors-anywhere.herokuapp.com/https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=',
        user_base_url: 'https://cors-anywhere.herokuapp.com/http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=',
        //ge_base_url: 'https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=',
        rsb_base_url: 'https://api.rsbuddy.com/grandExchange?a=guidePrice&i=',

        modal: false,
        step: 1,
        disabled: {
            step_one: false,
            step_two: true
        },
        base_equipment: [],
        current_equipment: [],
        equipment_list: [],
        task_list: [],
        total_task_weight: 0,
        price_list: [],
        selected_mobs: [],
        dps_difference: [],
        dmg_reduced_difference: [],
        average_mob: {
            'combat': {
                'attack': 0,
                'strength': 0,
                'defense': 0,
                'magic': 0,
                'range': 0
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
            },
            "other": {
                "strength": 0,
                "range": 0,
                "attack": 0
            }
        },
        username: '',
        user_levels: {
            'attack': 99,
            'strength': 99,
            'defense': 99,
            'range': 99,
            'magic': 99
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
            'crush': 0,
            'prayer': 0
        },
        base_dps: {
            'melee': 0,
            'range': 0,
            'magic-trident': 0,
            'magic-ancients': 0
        },
        base_defense: 0,
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

        this.$http.get('./assets/json/prices.json').then((data) => {
            this.price_list = data.body;
        });
    },

    methods: {
        canTrainStrength: function (task) {
            let tags_obj = task['tags'].split(",");
            for (let tag in tags_obj) {
                if (tags_obj[tag].trim() === 'strength') {
                    return true;
                }
            }

            return false;
        },
        checkDisabled: function (step) {
            if (step === 1) {
                this.disabled.step_one = false;

                for (let level in this.user_levels) {
                    if (this.user_levels[level] === '') {
                        this.disabled.step_one = true;
                    }
                }
            }
        },
        checkLevels: function () {
            this.disabled.step_one = false;

            for (let level in this.user_levels) {
                if (this.user_levels[level] === '') {
                    this.disabled.step_one = true;
                }
            }
        },
        checkActive: function (task) {
            if (typeof task !== 'undefined') {
                return 'active-task';
            }

            return '';
        },
        addItem: function (item) {
            this.equipment_list[0] = [];
            this.current_equipment[item['combat-style']][item['item-slot']] = item;

            let tags_obj = item['tags'].split(",");
            for (let tag in tags_obj) {
                if (tags_obj[tag].trim() === '2-handed') {
                    this.current_equipment[item['combat-style']]['off hand'] = item;
                }
            }

            this.refreshEquipmentList();
        },
        refreshEquipmentList: function() {
            let equipment = this.equipment_list;
            let new_equipment = [];
            for (let item in equipment) {

                if (equipment[item].length !== 0) {
                    new_equipment.push(equipment[item]);
                }
            }

            this.equipment_list = new_equipment;
            this.calculateChangePercentage();
        },
        calculateChangePercentage: function() {
            this.dps_difference = '';
            let new_number = 0;
            let original_number = 0;
            let index = Object.keys(this.equipment_list)[0];

            if (this.equipment_list[index]['combat-style'] === 'magic') {
                if (this.equipment_list[index]['item-slot'] === 'main hand aoe') {
                    new_number = this.equipment_list[index]['dps'] + this.base_dps['magic-ancients'];
                    original_number = this.current_equipment[this.equipment_list[index]['combat-style']][this.equipment_list[index]['item-slot']]['dps'] + this.base_dps['magic-ancients'];
                } else {
                    new_number = this.equipment_list[index]['dps'] + this.base_dps['magic-trident'];
                    original_number = this.current_equipment[this.equipment_list[index]['combat-style']][this.equipment_list[index]['item-slot']]['dps'] + this.base_dps['magic-trident'];
                }
            } else {
                new_number = this.equipment_list[index]['dps'] + this.base_dps[this.equipment_list[index]['combat-style']];
                original_number = this.current_equipment[this.equipment_list[index]['combat-style']][this.equipment_list[index]['item-slot']]['dps'] + this.base_dps[this.equipment_list[index]['combat-style']];
            }

            this.dps_difference = (((new_number - original_number) / original_number) * 100).toFixed(2);


            this.dmg_reduced_difference = 0;
            index = Object.keys(this.equipment_list)[0];

            if (this.equipment_list[index]['combat-style'] === 'melee' && typeof this.equipment_list[index]['damage-reduced'] !== 'undefined') {
                new_number = this.equipment_list[index]['damage-reduced'] + this.base_defense;
                original_number = this.current_equipment[this.equipment_list[index]['combat-style']][this.equipment_list[index]['item-slot']]['damage-reduced'] + this.base_defense;

                this.dmg_reduced_difference = (((new_number - original_number) / original_number) * 100).toFixed(2);
            }
        },
        checkCrush: function(task) {
            let tags_obj = task['tags'].split(",");
            for (let tag in tags_obj) {
                if (tags_obj[tag].trim() === 'crush') {
                    return true;
                }
            }

            return false;
        },
        calculateOrder: function () {
            this.getBaseEquipment();
            this.getEquipment();
        },
        calculateCombatStyle: function() {
            let melee_selected = document.querySelectorAll('.melee-style');
            let crush_selected = document.querySelectorAll('.crush-style');
            let prayer_selected = document.querySelectorAll('.prayer-style');
            let range_selected = document.querySelectorAll('.range-style');
            let magic_selected = document.querySelectorAll('.magic-style');
            let aoe_selected = document.querySelectorAll('.aoe-style');

            let total_selected_count = 0;
            let melee_count = 0;
            let range_count = 0;
            let magic_count = 0;
            let aoe_count = 0;
            let crush_count = 0;
            let prayer_count = 0;

            let current_value = 0;

            this.task_styles = {
                'melee' : 0.0,
                'range' : 0.0,
                'magic' : 0.0,
                'aoe': 0.0,
                'crush': 0.0
            };

            for (let i = 0; i < crush_selected.length; i++) {
                current_value = crush_selected[i].value;
                if (crush_selected[i].checked === true) {
                    melee_count += parseInt(current_value);
                    crush_count += parseInt(current_value);
                    if (prayer_selected[i].checked === true) {
                        prayer_count += parseInt(current_value);
                    }
                }
            }

            for (let i = 0; i < melee_selected.length; i++) {
                current_value = melee_selected[i].value;
                if (melee_selected[i].checked === true) {
                    melee_count += parseInt(current_value);
                    if (prayer_selected[i].checked === true) {
                        prayer_count += parseInt(current_value);
                    }
                }
            }

            for (let i = 0; i < range_selected.length; i++) {
                current_value = range_selected[i].value;
                if (range_selected[i].checked === true) {
                    range_count += parseInt(current_value);
                }
            }

            for (let i = 0; i < magic_selected.length; i++) {
                current_value = magic_selected[i].value;
                if (magic_selected[i].checked === true) {
                    magic_count += parseInt(current_value);
                }
            }

            for (let i = 0; i < aoe_selected.length; i++) {
                current_value = aoe_selected[i].value;
                if (aoe_selected[i].checked === true) {
                    aoe_count += parseInt(current_value);
                }
            }

            this.task_styles = {
                'melee' : melee_count / this.total_task_weight,
                'range' : range_count / this.total_task_weight,
                'magic' : magic_count / this.total_task_weight,
                'aoe': aoe_count / this.total_task_weight,
                'crush': crush_count / this.total_task_weight,
                'prayer': prayer_count / this.total_task_weight
            };
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

            this.disabled.step_two = this.isEmpty(this.selected_mobs);
            this.calculateAverageMob();
        },
        isEmpty: function (obj) {
            for(let key in obj) {
                if(obj.hasOwnProperty(key))
                    return false;
            }
            return true;
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
                    'range': 0
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
                },
                "other": {
                    "strength": 0,
                    "range": 0,
                    "attack": 0
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
                    },
                    "other": {
                        "strength": this.average_mob.other.strength + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['other']['strength']),
                        "range": this.average_mob.other.range + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['other']['range']),
                        "attack": this.average_mob.other.attack + Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['other']['attack'])
                    }
                };
                average_defense += Math.round((this.selected_mobs[task]['task-weight'] / current_weight) * this.selected_mobs[task]['stats']['combat']['defense']);
            }
        },
        setStats: function() {
            this.user_levels.attack = Number(this.user_levels.attack);
            this.user_levels.strength = Number(this.user_levels.strength);
            this.user_levels.defense = Number(this.user_levels.defense);
            this.user_levels.range = Number(this.user_levels.range);
            this.user_levels.magic = Number(this.user_levels.magic);
           this.step = 2;
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
                    "range": all_user_data[5].split(","),
                    "magic": all_user_data[7].split(","),
                };

                this.user_levels.attack = parseInt(combat_data.attack[1]);
                this.user_levels.defense = parseInt(combat_data.defense[1]);
                this.user_levels.strength = parseInt(combat_data.strength[1]);
                this.user_levels.hitpoints = parseInt(combat_data.hitpoints[1]);
                this.user_levels.range = parseInt(combat_data.range[1]);
                this.user_levels.magic = parseInt(combat_data.magic[1]);

                this.step = 2;
            });
        },
        getBaseEquipment: function() {
            this.$http.get('./assets/json/base-equipment.json').then((data) => {
                let equipment = data.body;

                let base_dps = {
                    'melee': this.calculateDPS(this.base_dps_stats['melee'], 'base-dps', 'melee'),
                    'range': (this.calculateDPS(this.base_dps_stats['range'], 'base-dps', 'range')),
                    'magic-trident': this.calculateDPS(this.base_dps_stats['magic-trident'], 'base-dps, trident-max-hit', 'magic'),
                    'magic-ancients': this.calculateDPS(this.base_dps_stats['magic-ancients'], 'base-dps, ancients-max-hit,', 'magic'),
                };
                this.base_dps = base_dps;

                let base_defense = this.calculateDamageTaken();
                this.base_defense = base_defense;

                for (let key in equipment) {
                    if (equipment[key]['combat-style'] === 'all') {
                        equipment[key + '-melee'] = equipment[key];
                        equipment[key + '-range'] = equipment[key];
                        equipment[key + '-magic'] = equipment[key];

                        let melee_dps = this.calculateDPS(equipment[key]['stats'], equipment[key]['tags'], 'melee');
                        melee_dps -= base_dps['melee'];

                        let max_type = equipment[key + '-melee']['stats']['defense']['slash'];
                        let max_type_name = 'slash';

                        for (let type in equipment[key + '-melee']['stats']['defense']) {
                            if (equipment[key + '-melee']['stats']['defense'][type] > max_type) {
                                max_type = equipment[key + '-melee']['stats']['defense'][type];
                                max_type_name = type;
                            }
                        }
                        let damage_reduced = base_defense - this.calculateDamageTaken(max_type, max_type_name)
                        equipment[key + '-melee']['damage-reduced'] = (damage_reduced) * (1 - this.task_styles.prayer);


                        let range_dps = this.calculateDPS(equipment[key]['stats'], equipment[key]['tags'], 'range');
                        range_dps -= base_dps['range'];

                        let magic_dps = this.calculateDPS(equipment[key]['stats'], 'trident-max-hit,', 'magic');
                        magic_dps -= base_dps['magic-trident'];

                        equipment[key + '-melee']['dps'] = melee_dps;
                        equipment[key + '-range']['dps'] = range_dps;
                        equipment[key + '-magic']['dps'] = magic_dps;
                        equipment[key + '-magic']['dps'] = magic_dps;
                    } else {
                        equipment[key]['dps'] = this.calculateDPS(equipment[key]['stats'], equipment[key]['tags'], equipment[key]['combat-style']);
                        console.log( equipment[key]);
                    }

                    if (typeof this.price_list[key]['price-data'] !== 'undefined' && this.price_list[key]['price-data'] !== null) {
                        equipment[key]['price'] = this.getItemPrice(this.price_list[key]['price-data'].item.current.price);
                    }

                    if(equipment[key]['item-slot'] !== 'main hand' && equipment[key]['item-slot'] !== 'main hand strength') {
                        if (equipment[key]['combat-style'] === 'melee') {
                            equipment[key]['dps'] -= base_dps['melee'];
                        }
                        if (equipment[key]['combat-style'] === 'range') {
                            equipment[key]['dps'] -= base_dps['range'];
                        }
                    }
                    if(equipment[key]['item-slot'] !== 'main hand' && equipment[key]['item-slot'] !== 'main hand aoe' && equipment[key]['combat-style'] === 'magic') {
                        equipment[key]['dps'] -= base_dps['magic-trident'];
                    }

                    let tags_obj = [];
                    let crush_check = false;
                    if((equipment[key]['item-slot'] === 'main hand' || equipment[key]['item-slot'] === 'main hand aoe') && equipment[key]['combat-style'] === 'magic') {
                        tags_obj = equipment[key]['tags'].split(",");
                        let aoe = false;
                        for (let tag in tags_obj) {
                            if (tags_obj[tag].trim() === 'aoe') {
                                equipment[key]['dps'] -=  base_dps['magic-ancients'];
                            }
                        }
                    }
                    if (equipment[key]['combat-style'] === 'melee') {
                        let max_type = equipment[key]['stats']['defense']['slash'];
                        let max_type_name = 'slash';

                        for (let type in equipment[key]['stats']['defense']) {
                            if (equipment[key]['stats']['defense'][type] > max_type) {
                                max_type = equipment[key]['stats']['defense'][type];
                                max_type_name = type;
                            }
                        }
                        let damage_reduced = base_defense - this.calculateDamageTaken(max_type, max_type_name)
                        equipment[key]['damage-reduced'] = (damage_reduced) * (1 - this.task_styles.prayer);
                    }
                }

                this.base_equipment = equipment;

                this.base_equipment['4587']['dps'] += this.base_equipment['12954']['dps'];

                this.current_equipment = {
                    'melee' : {
                        'main hand': equipment['4587'],
                        'main hand strength': equipment['4587'],
                        'off hand': equipment['12954'],
                        'chest': equipment['10551'],
                        'legs': equipment['1079'],
                        'boots': equipment['3105'],
                        'hands': equipment['7462'],
                        'back': equipment['6570'],
                        'ammo': equipment['20235-melee'],
                        'neck':  equipment['1704-melee'],
                        'ring': equipment['1635'],
                    },
                    'prayer': {
                        'chest': equipment['9674'],
                        'legs': equipment['9676']
                    },
                    'range': {
                        'main hand': equipment['9185'],
                        'off hand': equipment['13153'],
                        'chest': equipment['12492'],
                        'legs': equipment['12494'],
                        'boots': equipment['6328'],
                        'hands': equipment['7462'],
                        'back': equipment['10499'],
                        'neck':  equipment['1704-range'],
                        'ring': equipment['1635'],
                    },
                    'magic': {
                        'main hand': equipment['11907'],
                        'off hand': equipment['20716'],
                        'main hand aoe': equipment['4675'],
                        'chest': equipment['4091'],
                        'legs': equipment['4093'],
                        'boots': equipment['4097'],
                        'hands': equipment['7462'],
                        'back': equipment['2412'],
                        'neck':  equipment['1704-magic'],
                        'ring': equipment['1635'],
                    }
                };
                console.log(this.current_equipment);
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
                };

                this.base_dps = base_dps;

                let base_defense = this.calculateDamageTaken();
                this.base_defense = base_defense;

                for (let key in equipment) {
                    equipment[key]['dps'] = this.calculateDPS(equipment[key]['stats'], equipment[key]['tags'], equipment[key]['combat-style']);
                    equipment[key]['price'] = this.getItemPrice(this.price_list[key]['price-data'].item.current.price);

                    if (isNaN(equipment[key]['dps'])) {
                        equipment[key]['dps'] = 0;
                    }

                    if(equipment[key]['item-slot'] !== 'main hand' && equipment[key]['item-slot'] !== 'main hand strength') {
                        if (equipment[key]['combat-style'] === 'melee') {
                            equipment[key]['dps'] -= base_dps['melee'];
                        }
                        if (equipment[key]['combat-style'] === 'range') {
                            equipment[key]['dps'] -= base_dps['range'];
                        }
                    }
                    if(equipment[key]['item-slot'] !== 'main hand' && equipment[key]['item-slot'] !== 'main hand aoe' && equipment[key]['combat-style'] === 'magic') {
                        equipment[key]['dps'] -= base_dps['magic-trident'];
                    }

                    let tags_obj = [];
                    let crush_check = false;
                    let two_hand_check = false;

                    if((equipment[key]['item-slot'] === 'main hand' || equipment[key]['item-slot'] === 'main hand aoe') && equipment[key]['combat-style'] === 'magic') {
                        tags_obj = equipment[key]['tags'].split(",");
                        let aoe = false;
                        for (let tag in tags_obj) {
                            if (tags_obj[tag].trim() === 'aoe') {
                                equipment[key]['dps'] -=  base_dps['magic-ancients'];
                            } else {
                                //equipment[key]['dps'] -=  base_dps['magic-trident'];
                            }
                            equipment[key]['rank'] = (1000000 * (equipment[key]['dps'] / equipment[key]['price'])) * ((this.task_styles[equipment[key]['combat-style']] * this.task_styles['aoe']));
                        }
                    } else if((equipment[key]['item-slot'] === 'main hand' || equipment[key]['item-slot'] === 'main hand strength' ) && equipment[key]['combat-style'] === 'melee') {
                        tags_obj = equipment[key]['tags'].split(",");

                        for (let tag in tags_obj) {
                            if (tags_obj[tag].trim() === 'crush' && typeof equipment[key]['rank'] === 'undefined') {
                                crush_check = true;
                            }
                            if (tags_obj[tag].trim() === '2-handed') {
                                two_hand_check = true;
                            }
                        }

                        if (two_hand_check === false) {
                            equipment[key]['dps'] += this.current_equipment['melee']['off hand']['dps'];
                        }

                        if (crush_check === true) {
                            equipment[key]['rank'] = (1000000 * (equipment[key]['dps'] / equipment[key]['price'])) * ((this.task_styles[equipment[key]['combat-style']] * this.task_styles['crush']));
                        } else {
                            equipment[key]['rank'] = (1000000 * (equipment[key]['dps'] / equipment[key]['price'])) * (this.task_styles[equipment[key]['combat-style']]);
                        }
                    } else {
                        if (equipment[key]['combat-style'] === 'melee') {
                            let max_type = equipment[key]['stats']['defense']['slash'];
                            let max_type_name = 'slash';

                            for (let type in equipment[key]['stats']['defense']) {
                                if (equipment[key]['stats']['defense'][type] > max_type) {
                                    max_type = equipment[key]['stats']['defense'][type];
                                    max_type_name = type;
                                }
                            }
                            let damage_reduced =  base_defense - this.calculateDamageTaken(max_type, max_type_name)
                            equipment[key]['damage-reduced'] = (damage_reduced) * (1 - this.task_styles.prayer);
                            equipment[key]['rank'] = (1000000 * ((equipment[key]['dps'] + equipment[key]['damage-reduced']) / equipment[key]['price'])) * (this.task_styles[equipment[key]['combat-style']]);

                        } else {
                            equipment[key]['rank'] = (1000000 * (equipment[key]['dps'] / equipment[key]['price'])) * (this.task_styles[equipment[key]['combat-style']]);
                        }
                    }
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

                this.equipment_list = sortable_equipment;
                this.step = 3;
                document.getElementById('app').scrollIntoView();
                this.calculateChangePercentage();
            });
        },
        getItemPrice: function (short_price) {
            let whole_price = short_price;
            let last_letter = '';
            let final_price = '';

            if (Number.isInteger(whole_price) === false) {
                last_letter = whole_price.slice(-1);
                final_price = whole_price.slice(0, -1);
            }

            if (last_letter === 'm') {
                final_price *= 1000000;
            } else if (last_letter === 'k') {
                final_price *= 1000;
            }

            return final_price;
        },
        calculateDamageTaken: function (defense_bonus = 0, style = null) {
            let max_type = 0;
            let max_type_name = 'crush';
            let attack_speed = 2.4;
            let accuracy = 0;
            let max_hit = 0;
            let strength = 0;
            let effective_attack = 0;
            let effective_strength = 0;
            let mob_defense_roll = {
                'stab': (this.user_levels.defense + 9) * (64 + defense_bonus),
                'slash': (this.user_levels.defense + 9) * (64 + defense_bonus),
                'crush': (this.user_levels.defense + 9) * (64 + defense_bonus),
                'magic': (this.user_levels.magic + 9) * (64 + defense_bonus),
                'range': (this.user_levels.range + 9) * (64 + defense_bonus),
            };

            strength = this.average_mob['other']['strength'];

            for (let type in this.average_mob['attack']) {
                if (this.average_mob['attack'][type] > max_type) {
                    max_type = this.average_mob['attack'][type];
                    max_type_name = type;
                }
            }

            effective_attack = this.average_mob.combat.attack + 8;
            effective_strength = this.average_mob.combat.strength + 8;


            max_hit = Math.floor((0.5 + effective_strength * (64 + strength) / 640));

            let max_attack_roll = Math.floor(effective_attack * (max_type + 64));
            let max_mob_defense_roll = mob_defense_roll[max_type_name];
            if (max_attack_roll > max_mob_defense_roll) {
                accuracy = 1 - (max_mob_defense_roll + 2) / (2 * (max_attack_roll + 1))
            } else {
                accuracy = max_attack_roll / (2 * (max_mob_defense_roll + 1));
            }
            let average_damage = ((max_hit * (max_hit + 1) / 2)) / (max_hit + 1);
            average_damage = average_damage * accuracy;


            return average_damage / attack_speed;
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
                'range': (this.average_mob["combat"].range + 9) * (64 + this.average_mob["defense"].range),
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
                max_type_name = 'range';

                effective_attack = this.user_levels.range + 8;
                effective_strength = this.user_levels.range + 8;

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
        }
    }
});