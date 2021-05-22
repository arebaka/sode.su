<script type="text/javascript">
    const titles = {
        404: "Not Found"
    };

    export let code;

    console.log(code, titles)
</script>

<p id="error-code">{code}</p>
<p id="error-title">{titles[code]}</p>
