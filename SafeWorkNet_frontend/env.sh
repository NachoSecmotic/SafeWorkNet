#!/bin/bash


rm -rf ./env-config.js
touch ./env-config.js


echo "window._env_ = {" >> ./env-config.js


while read -r line || [[ -n "$line" ]]; do
  # Dividir las líneas en clave=valor
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  value=$(printenv "$varname")

  [[ -z $value ]] && value=${varvalue}


  echo "  $varname: \"$value\"," >> ./env-config.js
done < .env

echo "};" >> ./env-config.js
