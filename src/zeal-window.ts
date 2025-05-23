import { Config } from "./electron-store";

export interface ZealPipe {
  character: string;
  data: { type: number; value: string | number }[];
  type: number;
  data_len: number;
}

type ZealWindow = Window & {
  zeal: {
    onZealPipes: (cb: (pipes: ZealPipe[]) => void) => void;
    close: () => void;
    minimize: () => void;
    sendToDiscord: (text: string) => void;
    saveSettings: (discordWebhookUrl: string) => void;
    copyText: (text: string) => void;
    onGetReportShortcut: (cb: () => void) => void;
    onCloseAllShortcut: (cb: () => void) => void;
    onDeclareAllWinnersShortcut: (cb: () => void) => void;
    getSettings: () => void;
    getVersion: () => void;
    onSettingsLoaded: (cb: (settings: Config) => void) => void;
    onVersionLoaded: (cb: (version: string) => void) => void;
    onLockChanged: (cb: (isLocked: boolean) => void) => void;
    setLock: (isLocked: boolean) => void;
  };
};

export const zealWindow = window as unknown as ZealWindow;

export enum PipeType {
  Log,
  Label, // value is string
  Gauge, // value is number
  Player,
  Custom,
  Raid
}

export enum DataPipeType {
  OtherGuildChat = 259,
  YourGuildChat = 310
}

export enum GaugeType {
  Unused,
  Hp,
  Mana,
  Stamina,
  Experience,
  AltExperience,
  Target,
  Cast,
  Breath,
  Memorize,
  Scribe,
  GroupHp1,
  GroupHp2,
  GroupHp3,
  GroupHp4,
  GroupHp5,
  PetHp,
  GroupPetHp1,
  GroupPetHp2,
  GroupPetHp3,
  GroupPetHp4,
  GroupPetHp5,
  ExperiencePerHour = 23
}

export enum LabelType {
  Unused,
  Name,
  Level,
  Class,
  Deity,
  Strength,
  Stamina,
  Dexterity,
  Agility,
  Wisdom,
  Intelligence,
  Charisma,
  PoisonResist,
  DiseaseResist,
  FireResist,
  ColdResist,
  MagicResist,
  CurrentHp,
  MaxHp,
  HpPercent,
  ManaPercent,
  StaminaPercent,
  CurrentAc,
  CurrentAtk,
  Weight,
  MaxWeight,
  ExperiencePercent,
  AlternateExperiencePercent,
  TargetName,
  TargetHpPercent,
  GroupName1,
  GroupName2,
  GroupName3,
  GroupName4,
  GroupName5,
  GroupHp1,
  GroupHp2,
  GroupHp3,
  GroupHp4,
  GroupHp5,
  GroupPetHp1,
  GroupPetHp2,
  GroupPetHp3,
  GroupPetHp4,
  GroupPetHp5,
  Buff0,
  Buff1,
  Buff2,
  Buff3,
  Buff4,
  Buff5,
  Buff6,
  Buff7,
  Buff8,
  Buff9,
  Buff10,
  Buff11,
  Buff12,
  Buff13,
  Buff14,
  SpellName1,
  SpellName2,
  SpellName3,
  SpellName4,
  SpellName5,
  SpellName6,
  SpellName7,
  SpellName8,
  PetName,
  PetHpPercent,
  CurrentHpAndMaxHp,
  CurrentAaPoints,
  CurrentAAPercent,
  LastName,
  Title,
  CurrentManaAndMaxMana = 80,
  ExperiencePerHour,
  TargetPetOwner,
  Mana = 124,
  MaxMana,
  CastingSpellName = 134
}
