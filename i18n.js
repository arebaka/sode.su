module.exports = {
	eng: {
		meta: {
			lang:            "en",
			separator:       ", ",
			super_separator: "; "
		},
		errors: {
			[404]: {
				title: "404 – sode.su",
				descr: "Not Found"
			}
		},
		index: {
			title: "sode.su – an antisocial network",
			descr: "A social network with cool markup and custom themes for doomers and other autists."
		},
		settings: {
			title: "Settings – sode.su",
			descr: "",
		},
		user: {
			title: "{{name}} – sode.su",
			descr: "A favorite user of sode.su antisotial network",
			default: {
				name: "Anon"
			}
		}
	},
	rus: {
		meta: {
			lang:            "ru",
			separator:       ", ",
			super_separator: "; "
		},
		errors: {
			[404]: {
				title: "404 – sode.su",
				descr: "Not Found"
			}
		},
		index: {
			title: "sode.su – анонимная социальная сеть",
			descr: "Социальная сеть с крутой разметкой и пользовательскими темами оформления для думеров и прочих аутистов."
		},
		settings: {
			title: "Настройки – sode.su",
			descr: "",
		},
		user: {
			title: "{{name}} – sode.su",
			descr: "Любимый пользователь антисоциальной сети sode.su",
			default: {
				name: "Анон"
			}
		}
	}
};

