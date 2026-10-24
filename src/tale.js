function kolobok(character) {
  switch (character) {
    case 'дедушка':
      return 'Я от дедушки ушёл'
    case 'заяц':
      return 'Я от зайца ушёл'
    case 'лиса':
      return 'Меня съели'
  }
}
console.log(kolobok('дедушка'))
console.log(kolobok('заяц'))
console.log(kolobok('лиса'))
function newYear(character) {
  return `${character}! ${character}! ${character}!`
}
console.log(newYear('Дед Мороз'))
console.log(newYear('Снегурочка'))
