declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		
	};

	type DataEntryMap = {
		"images": {
"1698916978723": {
	id: "1698916978723";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1698917118499": {
	id: "1698917118499";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1698923879190": {
	id: "1698923879190";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1698924126666": {
	id: "1698924126666";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1698926685021": {
	id: "1698926685021";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1698966214039": {
	id: "1698966214039";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699052522194": {
	id: "1699052522194";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699138896351": {
	id: "1699138896351";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699225316037": {
	id: "1699225316037";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699318097108": {
	id: "1699318097108";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699398119532": {
	id: "1699398119532";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699484543437": {
	id: "1699484543437";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699571000270": {
	id: "1699571000270";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699679835366": {
	id: "1699679835366";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699746524212": {
	id: "1699746524212";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699830133155": {
	id: "1699830133155";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1699916466999": {
	id: "1699916466999";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700002904710": {
	id: "1700002904710";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700097328536": {
	id: "1700097328536";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700175690033": {
	id: "1700175690033";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700262071421": {
	id: "1700262071421";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700384246473": {
	id: "1700384246473";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700434899044": {
	id: "1700434899044";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700521287666": {
	id: "1700521287666";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700607697290": {
	id: "1700607697290";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700694113422": {
	id: "1700694113422";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700780499345": {
	id: "1700780499345";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700888309060": {
	id: "1700888309060";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1700953315864": {
	id: "1700953315864";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701039684746": {
	id: "1701039684746";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701126093135": {
	id: "1701126093135";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701212470471": {
	id: "1701212470471";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701298887460": {
	id: "1701298887460";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701398388632": {
	id: "1701398388632";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701422869761": {
	id: "1701422869761";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701480355830": {
	id: "1701480355830";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701558083590": {
	id: "1701558083590";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701644571576": {
	id: "1701644571576";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701731036280": {
	id: "1701731036280";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701817356209": {
	id: "1701817356209";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701903730901": {
	id: "1701903730901";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1701990115321": {
	id: "1701990115321";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702076489592": {
	id: "1702076489592";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702162909387": {
	id: "1702162909387";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702249279448": {
	id: "1702249279448";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702335695652": {
	id: "1702335695652";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702422069293": {
	id: "1702422069293";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702508476866": {
	id: "1702508476866";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702594904914": {
	id: "1702594904914";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702681285389": {
	id: "1702681285389";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702767686122": {
	id: "1702767686122";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702854104398": {
	id: "1702854104398";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1702940507988": {
	id: "1702940507988";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703026895982": {
	id: "1703026895982";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703113336669": {
	id: "1703113336669";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703199695062": {
	id: "1703199695062";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703286089351": {
	id: "1703286089351";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703372492434": {
	id: "1703372492434";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703458881460": {
	id: "1703458881460";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703545280944": {
	id: "1703545280944";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703631688593": {
	id: "1703631688593";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703718101099": {
	id: "1703718101099";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703804491218": {
	id: "1703804491218";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703890910069": {
	id: "1703890910069";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1703977289676": {
	id: "1703977289676";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1704063671957": {
	id: "1704063671957";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1704150122525": {
	id: "1704150122525";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1704236513020": {
	id: "1704236513020";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1704322920025": {
	id: "1704322920025";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1704676076634": {
	id: "1704676076634";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1704754883224": {
	id: "1704754883224";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1704841267810": {
	id: "1704841267810";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1704942708300": {
	id: "1704942708300";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705014099240": {
	id: "1705014099240";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705100477715": {
	id: "1705100477715";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705186883433": {
	id: "1705186883433";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705273295681": {
	id: "1705273295681";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705359701742": {
	id: "1705359701742";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705450755653": {
	id: "1705450755653";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705532491859": {
	id: "1705532491859";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705618926844": {
	id: "1705618926844";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705705300034": {
	id: "1705705300034";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705791691030": {
	id: "1705791691030";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705878107603": {
	id: "1705878107603";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1705964514206": {
	id: "1705964514206";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706050881950": {
	id: "1706050881950";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706137294605": {
	id: "1706137294605";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706223693653": {
	id: "1706223693653";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706310087096": {
	id: "1706310087096";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706396485068": {
	id: "1706396485068";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706482894710": {
	id: "1706482894710";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706569294275": {
	id: "1706569294275";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706655676248": {
	id: "1706655676248";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706742108288": {
	id: "1706742108288";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706828483067": {
	id: "1706828483067";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1706914889332": {
	id: "1706914889332";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1707001285290": {
	id: "1707001285290";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1707087679561": {
	id: "1707087679561";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1707174092926": {
	id: "1707174092926";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1707260494895": {
	id: "1707260494895";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1707346901986": {
	id: "1707346901986";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1707433286797": {
	id: "1707433286797";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1707519680855": {
	id: "1707519680855";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1708225229850": {
	id: "1708225229850";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1708297308857": {
	id: "1708297308857";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1708393594526": {
	id: "1708393594526";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1708470081436": {
	id: "1708470081436";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1708556510612": {
	id: "1708556510612";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1708642906614": {
	id: "1708642906614";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1708729272281": {
	id: "1708729272281";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1708815673938": {
	id: "1708815673938";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1708902073751": {
	id: "1708902073751";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1708988492955": {
	id: "1708988492955";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1709074895265": {
	id: "1709074895265";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1709161283730": {
	id: "1709161283730";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1709247681880": {
	id: "1709247681880";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1709334056543": {
	id: "1709334056543";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1709420475550": {
	id: "1709420475550";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1709528962757": {
	id: "1709528962757";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1709593364400": {
	id: "1709593364400";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1709679708775": {
	id: "1709679708775";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1709766104460": {
	id: "1709766104460";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1709852484371": {
	id: "1709852484371";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1710025258097": {
	id: "1710025258097";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1710111680055": {
	id: "1710111680055";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1710198100713": {
	id: "1710198100713";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1710284478388": {
	id: "1710284478388";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1710370885439": {
	id: "1710370885439";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1710543663203": {
	id: "1710543663203";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1710630073211": {
	id: "1710630073211";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1710716468942": {
	id: "1710716468942";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1710975659454": {
	id: "1710975659454";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711062067985": {
	id: "1711062067985";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711148470762": {
	id: "1711148470762";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711234864523": {
	id: "1711234864523";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711321276072": {
	id: "1711321276072";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711407677597": {
	id: "1711407677597";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711494061420": {
	id: "1711494061420";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711580469151": {
	id: "1711580469151";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711666873233": {
	id: "1711666873233";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711753265106": {
	id: "1711753265106";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711839666730": {
	id: "1711839666730";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1711926071230": {
	id: "1711926071230";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1712012468196": {
	id: "1712012468196";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1712098872021": {
	id: "1712098872021";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1712816974677": {
	id: "1712816974677";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1712876473529": {
	id: "1712876473529";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1712962864081": {
	id: "1712962864081";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713049309362": {
	id: "1713049309362";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713137434982": {
	id: "1713137434982";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713222077226": {
	id: "1713222077226";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713308475045": {
	id: "1713308475045";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713394868379": {
	id: "1713394868379";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713481268019": {
	id: "1713481268019";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713568373741": {
	id: "1713568373741";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713654070551": {
	id: "1713654070551";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713740467844": {
	id: "1713740467844";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713826872454": {
	id: "1713826872454";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713913273156": {
	id: "1713913273156";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1713999667804": {
	id: "1713999667804";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714122869302": {
	id: "1714122869302";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714172470115": {
	id: "1714172470115";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714258871931": {
	id: "1714258871931";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714345265996": {
	id: "1714345265996";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714431662898": {
	id: "1714431662898";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714535184846": {
	id: "1714535184846";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714604470195": {
	id: "1714604470195";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714690885843": {
	id: "1714690885843";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714799472071": {
	id: "1714799472071";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714863680823": {
	id: "1714863680823";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1714950068047": {
	id: "1714950068047";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1715122872472": {
	id: "1715122872472";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1715230672582": {
	id: "1715230672582";
  collection: "images";
  data: InferEntrySchema<"images">
};
"1715295670619": {
	id: "1715295670619";
  collection: "images";
  data: InferEntrySchema<"images">
};
};

	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
