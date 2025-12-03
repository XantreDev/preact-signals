def editor_alias [] {
    if (which zed | length | $in > 0) {
        return "zed"
    }
    if (which zeditor | length | $in > 0) {
        return "zeditor"
    }
    return null
}

def main [
  name: string,
  --with-options
] {
    cd ./fixtures/

    mkdir $name

    let in_file = $"./($name)/in.js"
    let editor = editor_alias

    "" | save $in_file
    if (--with-options == "true") {
        $'{\n  "file_name": null,\n  "options": null\n}' | save $"./($name)/options.json"
    }

    if ($editor != null) {
        run-external $editor $in_file
    }
}
