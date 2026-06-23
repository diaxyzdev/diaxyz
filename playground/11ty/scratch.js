const pendingTranslations = new Set();

pendingTranslations.add(1);
console.log(pendingTranslations.has(1));
console.log(pendingTranslations.has(0));
// const RE_LIQUID_INTERPOLATION = /(\{\{[\s\S]*?\}\}|\{\%[\s\S]*?\%\})/g;
// const str = "Welcome {{ user.name }} to our {{ user.name }} Multi-lingual Site {{ user.pp }} !";

// const matches = Array.from(str.matchAll(RE_LIQUID_INTERPOLATION));
// let i = 0;
// let text = "";
// console.log(matches);
// const parts = [];

// for (; i <= matches.length; i++) {
//   if (i === 0) {
//     text += str.slice(0, matches[i].index - 1);
//     continue;
//   }

//   if (i === matches.length) {
//     text += str.slice(matches[i-1].index + matches[i-1][0].length);
//     continue;
//   }

//   parts.push(str.slice(
//     matches[i-1].index + matches[i-1][0].length,
//     matches[i].index - 1
//   ));

//   text += str.slice(
//     matches[i-1].index + matches[i-1][0].length,
//     matches[i].index - 1
//   );
// }

// console.log(text);
// console.log(text.length);
