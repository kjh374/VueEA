<template>
<li>
    <div @click="toggle">
        {{ model.name }}
        <span v-if="isFolder">[{{ isOpen ? '-' : '+' }}]</span>
    </div>
    <ul v-show="isOpen" v-if="isFolder">
    </ul>
</li>
</template>

<script>
export default {
    name: 'TreeItem',
    props: {
        model: Object
    },
    data() {
        return {
            isOpen: false
        }
    },
    methods: {
        toggle() {
            this.isOpen = !this.isOpen
        }
    },
    computed: {
        isFolder: function() {
            return this.model.children && this.model.children.length;
        }
    },
    mounted() {
        console.log(this.model);
    }
}

</script>

<style>
li {
    list-style: none;
}
</style>